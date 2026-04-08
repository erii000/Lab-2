using System.Collections.Concurrent;
using TravelAssistant.Services.UserService.Models.Entities;
using TravelAssistant.Services.UserService.Repositories.Interfaces;

namespace TravelAssistant.Services.UserService.Repositories.InMemory;

public sealed class InMemoryRefreshTokenRepository : IRefreshTokenRepository
{
    private readonly ConcurrentDictionary<string, RefreshToken> _tokens = new(StringComparer.Ordinal);

    public Task<RefreshToken> AddAsync(RefreshToken token, CancellationToken cancellationToken = default)
    {
        _tokens[token.Token] = token;
        return Task.FromResult(token);
    }

    public Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        _tokens.TryGetValue(token, out var refreshToken);
        return Task.FromResult(refreshToken);
    }

    public Task RevokeAsync(string token, CancellationToken cancellationToken = default)
    {
        if (_tokens.TryGetValue(token, out var refreshToken))
        {
            refreshToken.IsRevoked = true;
        }

        return Task.CompletedTask;
    }
}

