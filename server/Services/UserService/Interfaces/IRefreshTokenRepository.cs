using TravelAssistant.Services.UserService.Models.Entities;

namespace TravelAssistant.Services.UserService.Repositories.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken> AddAsync(RefreshToken token, CancellationToken cancellationToken = default);
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task RevokeAsync(string token, CancellationToken cancellationToken = default);
    Task RevokeAllForUserAsync(int userId, CancellationToken cancellationToken = default);
}

