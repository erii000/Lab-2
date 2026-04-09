using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.UserService.Data;
using TravelAssistant.Services.UserService.Models.Entities;
using TravelAssistant.Services.UserService.Repositories.Interfaces;

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
}
