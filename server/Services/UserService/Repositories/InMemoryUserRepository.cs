using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using TravelAssistant.Services.UserService.Models.Entities;
using TravelAssistant.Services.UserService.Repositories.Interfaces;
using UserService.DTOs.Admin;

namespace TravelAssistant.Services.UserService.Repositories.InMemory;

public sealed class InMemoryUserRepository : IUserRepository
{
    private readonly ConcurrentDictionary<int, User> _users = new();
    private int _nextId = 0;

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = _users.Values.FirstOrDefault(x => x.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(user);
    }

    public Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        _users.TryGetValue(id, out var user);
        return Task.FromResult(user);
    }

    public Task<User> AddAsync(User user, CancellationToken cancellationToken = default)
    {
        var id = Interlocked.Increment(ref _nextId);
        user.Id = id;
        _users.TryAdd(id, user);
        return Task.FromResult(user);
    }
    public async Task<User> UpdateAsync(User user, CancellationToken ct = default)
    {
        if (!_users.ContainsKey(user.Id))
        {
            throw new KeyNotFoundException($"User with ID {user.Id} not found.");
        }

        _users[user.Id] = user;
        return await Task.FromResult(user);
    }

    public Task<(IEnumerable<User> Users, int TotalCount)> GetUsersAsync(UserQueryParams query, CancellationToken ct)
    {
        var collection = _users.Values.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Email))
        {
            collection = collection.Where(u => u.Email.Contains(query.Email, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query.Role))
        {
            collection = collection.Where(u => u.UserRoles != null && u.UserRoles
                .Any(ur => ur.Role != null && ur.Role.Name.Equals(query.Role, StringComparison.OrdinalIgnoreCase)));
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            bool activeFilter = query.Status.Equals("Active", StringComparison.OrdinalIgnoreCase);
            collection = collection.Where(u => u.IsActive == activeFilter);
        }

        var totalCount = collection.Count();

        var items = collection
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToList();

        return Task.FromResult(((IEnumerable<User>)items, totalCount));
    }
}

