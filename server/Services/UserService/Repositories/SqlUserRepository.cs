using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.UserService.Data;
using TravelAssistant.Services.UserService.Models.Entities;
using TravelAssistant.Services.UserService.Repositories.Interfaces;
using UserService.DTOs.Admin;
using TravelAssistant.Services.UserService.Contracts.Auth;

namespace TravelAssistant.Services.UserService.Repositories;

public sealed class SqlUserRepository : IUserRepository
{
    private readonly ApplicationDbContext _dbContext;

    public SqlUserRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        return _dbContext.Users.FirstOrDefaultAsync(
            x => x.Email.ToLower() == normalizedEmail,
            cancellationToken);
    }

    public Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<User> AddAsync(User user, CancellationToken cancellationToken = default)
    {
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return user;
    }

    public async Task<User> UpdateAsync(User user, CancellationToken ct = default)
    {
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync(ct);
        return user;
    }

    public async Task<(IEnumerable<User> Users, int TotalCount)> GetUsersAsync(UserQueryParams query, CancellationToken ct)
    {
        var collection = _dbContext.Users
            .Include(u => u.UserRoles)     
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Email))
        {
            collection = collection.Where(u => u.Email.Contains(query.Email));
        }

        if (!string.IsNullOrWhiteSpace(query.Role))
        {
            collection = collection.Where(u => u.UserRoles
                .Any(ur => ur.Role != null && ur.Role.Name.Equals(query.Role, StringComparison.OrdinalIgnoreCase)));
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            bool activeFilter = query.Status.Equals("Active", StringComparison.OrdinalIgnoreCase);
            collection = collection.Where(u => u.IsActive == activeFilter);
        }

        var totalCount = await collection.CountAsync(ct);

        var items = await collection
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }
}
