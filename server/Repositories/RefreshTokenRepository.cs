using Microsoft.EntityFrameworkCore;
using SmartTravelAssistant.API.Data;
using SmartTravelAssistant.API.Models.Entities;
using SmartTravelAssistant.API.Repositories.Interfaces;

namespace SmartTravelAssistant.API.Repositories;

public sealed class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly ApplicationDbContext _context;

    public RefreshTokenRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RefreshToken> AddAsync(RefreshToken token, CancellationToken cancellationToken = default)
    {
        await _context.RefreshTokens.AddAsync(token, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return token;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.RefreshTokens
            .FirstOrDefaultAsync(x => x.Token == token, cancellationToken);
    }

    public async Task RevokeAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(x => x.Token == token, cancellationToken);

        if (refreshToken is not null)
        {
            refreshToken.IsRevoked = true;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}