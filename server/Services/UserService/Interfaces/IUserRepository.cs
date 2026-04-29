using TravelAssistant.Services.UserService.Models.Entities;
using UserService.DTOs.Admin;

namespace TravelAssistant.Services.UserService.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<User> AddAsync(User user, CancellationToken cancellationToken = default);
    Task<User> UpdateAsync(User user, CancellationToken cancellationToken = default);
    Task<(IEnumerable<User> Users, int TotalCount)> GetUsersAsync(UserQueryParams query, CancellationToken cancellationToken = default);
}

