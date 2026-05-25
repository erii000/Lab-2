using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.UserService.Models.Entities;
using UserService.Models;

namespace TravelAssistant.Services.UserService.Data;

/// <summary>
/// Idempotent seed for shared Azure DB: roles, admin account, and demo travelers.
/// </summary>
public static class ReferenceDataSeeder
{
    private static readonly (string Email, string First, string Last, string Password, string Role)[] SeedUsers =
    [
        ("admin@smarttravel.app", "Admin", "User", "admin12345", "Admin"),
        ("emma@example.com", "Emma", "Johnson", "Travel2026!", "Traveler"),
        ("arber@example.com", "Arber", "Krasniqi", "Travel2026!", "Traveler"),
        ("era@example.com", "Era", "Bytyqi", "Travel2026!", "Traveler"),
        ("gent@example.com", "Gent", "Dervishi", "Travel2026!", "Traveler"),
    ];

    public static async Task SeedAsync(ApplicationDbContext db, CancellationToken ct = default)
    {
        await EnsureRolesAsync(db, ct);

        foreach (var entry in SeedUsers)
        {
            await EnsureUserAsync(db, entry.Email, entry.First, entry.Last, entry.Password, entry.Role, ct);
        }
    }

    private static async Task EnsureRolesAsync(ApplicationDbContext db, CancellationToken ct)
    {
        var required = new[]
        {
            ("Admin", "Platform administrator"),
            ("Traveler", "Standard traveler account"),
        };

        foreach (var (name, description) in required)
        {
            if (!await db.Roles.AnyAsync(r => r.Name == name, ct))
            {
                db.Roles.Add(new Roles
                {
                    Name = name,
                    Description = description,
                    CreatedAt = DateTime.UtcNow,
                });
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private static async Task EnsureUserAsync(
        ApplicationDbContext db,
        string email,
        string firstName,
        string lastName,
        string password,
        string roleName,
        CancellationToken ct)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var user = await db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == normalized, ct);

        if (user is null)
        {
            user = new User
            {
                FirstName = firstName,
                LastName = lastName,
                Email = normalized,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };
            db.Users.Add(user);
            await db.SaveChangesAsync(ct);
        }

        var role = await db.Roles.FirstAsync(r => r.Name == roleName, ct);
        var hasRole = user.UserRoles.Any(ur => ur.RoleId == role.RolesId);
        if (!hasRole)
        {
            db.UserRoles.Add(new UserRoles
            {
                UserId = user.Id,
                RoleId = role.RolesId,
                AssignedAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync(ct);
        }
    }
}
