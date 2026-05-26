using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TravelAssistant.Services.UserService.Configuration;
using TravelAssistant.Services.UserService.Contracts.Auth;
using TravelAssistant.Services.UserService.Models.Entities;
using TravelAssistant.Services.UserService.Repositories.Interfaces;
using TravelAssistant.Common.Audit;
using TravelAssistant.Services.UserService.Services.Interfaces;
using UserService.Models;

namespace TravelAssistant.Services.UserService.Services.Auth;

public sealed class AuthService : IAuthService
{
    private const string DefaultTravelerRole = "Traveler";

    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IAuditWriter _auditWriter;
    private readonly JwtOptions _jwtOptions;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IAuditWriter auditWriter,
        IOptions<JwtOptions> jwtOptions)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _auditWriter = auditWriter;
        _jwtOptions = jwtOptions.Value;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken);
        if (existing is not null)
        {
            throw new InvalidOperationException("Email already exists.");
        }

        var user = new User
        {
            FirstName = request.Name.Trim(),
            LastName = string.IsNullOrWhiteSpace(request.Surname) ? string.Empty : request.Surname.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true
        };

        user = await _userRepository.AddAsync(user, cancellationToken);
        await _auditWriter.WriteAsync(user.Id, "Register", "User", $"Registered {user.Email}", cancellationToken);
        return await CreateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsActive || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        await _auditWriter.WriteAsync(user.Id, "Login", "User", user.Email, cancellationToken);
        return await CreateAuthResponseAsync(user, cancellationToken);
    }

    public async Task LogoutAsync(int userId, string? refreshToken, CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(refreshToken))
            await _refreshTokenRepository.RevokeAsync(refreshToken, cancellationToken);

        await _refreshTokenRepository.RevokeAllForUserAsync(userId, cancellationToken);
        await _auditWriter.WriteAsync(userId, "Logout", "User", null, cancellationToken);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var token = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid refresh token.");

        if (token.RevokedAt is not null || token.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Refresh token expired or revoked.");
        }

        var user = await _userRepository.GetByIdAsync(token.UserId, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not found.");

        await _refreshTokenRepository.RevokeAsync(request.RefreshToken, cancellationToken);
        return await CreateAuthResponseAsync(user, cancellationToken);
    }

    private async Task<AuthResponse> CreateAuthResponseAsync(User user, CancellationToken cancellationToken)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes);
        var accessToken = CreateAccessToken(user, expiresAt);

        var refreshTokenValue = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        var refreshToken = new RefreshToken
        {
            TokenHash = BCrypt.Net.BCrypt.HashPassword(refreshTokenValue),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays),
            UserId = user.Id
        };

        await _refreshTokenRepository.AddAsync(refreshToken, cancellationToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            ExpiresAtUtc = expiresAt
        };
    }

    private static IEnumerable<string> ResolveRoleNames(User user)
    {
        var fromDb = user.UserRoles
            .Where(ur => ur.Role is not null && !string.IsNullOrWhiteSpace(ur.Role.Name))
            .Select(ur => ur.Role!.Name)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return fromDb.Count > 0 ? fromDb : new[] { DefaultTravelerRole };
    }

    private string CreateAccessToken(User user, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var roleClaims = ResolveRoleNames(user)
            .Select(role => new Claim(ClaimTypes.Role, role))
            .ToList();

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.GivenName, user.FirstName),
            new(ClaimTypes.Surname, user.LastName),
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(roleClaims);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }


}

