using System.Collections.Concurrent;
using TravelAssistant.Services.UserService.Models.Entities;
using TravelAssistant.Services.UserService.Repositories.Interfaces;

namespace TravelAssistant.Services.UserService.Repositories.InMemory;

public sealed class InMemoryRefreshTokenRepository : IRefreshTokenRepository
{
    private readonly ConcurrentDictionary<string, RefreshToken> _tokens = new(StringComparer.Ordinal);

    public Task<RefreshToken> AddAsync(RefreshToken token, CancellationToken cancellationToken = default)
    {
        var key = Guid.NewGuid().ToString("N");
        _tokens[key] = token;
        return Task.FromResult(token);
    }

    public Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = _tokens.Values.FirstOrDefault(x => BCrypt.Net.BCrypt.Verify(token, x.TokenHash));
        return Task.FromResult(refreshToken);
    }

    public Task RevokeAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = _tokens.Values.FirstOrDefault(x => BCrypt.Net.BCrypt.Verify(token, x.TokenHash));
        if (refreshToken is not null)
        {
            refreshToken.RevokedAt = DateTime.UtcNow;
        }

        return Task.CompletedTask;
    }
}

