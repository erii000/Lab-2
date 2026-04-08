using System.Collections.Concurrent;
using TravelAssistant.Services.UserService.Models.Entities;
using TravelAssistant.Services.UserService.Repositories.Interfaces;

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
}

