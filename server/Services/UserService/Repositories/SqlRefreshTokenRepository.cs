using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.UserService.Data;
using TravelAssistant.Services.UserService.Models.Entities;
using TravelAssistant.Services.UserService.Repositories.Interfaces;

namespace TravelAssistant.Services.UserService.Repositories;

public sealed class SqlRefreshTokenRepository : IRefreshTokenRepository
{
    private readonly ApplicationDbContext _dbContext;

    public SqlRefreshTokenRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<RefreshToken> AddAsync(RefreshToken token, CancellationToken cancellationToken = default)
    {
        _dbContext.RefreshTokens.Add(token);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return token;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var activeTokens = await _dbContext.RefreshTokens
            .Where(x => x.RevokedAt == null && x.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return activeTokens.FirstOrDefault(x => BCrypt.Net.BCrypt.Verify(token, x.TokenHash));
    }

    public async Task RevokeAsync(string token, CancellationToken cancellationToken = default)
    {
        var existing = await GetByTokenAsync(token, cancellationToken);
        if (existing is null)
        {
            return;
        }

        existing.RevokedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RevokeAllForUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var tokens = await _dbContext.RefreshTokens
            .Where(x => x.UserId == userId && x.RevokedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var token in tokens)
            token.RevokedAt = DateTime.UtcNow;

        if (tokens.Count > 0)
            await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
