using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.UserService.Models.Entities; // Ensure this matches your folder path

namespace TravelAssistant.Services.UserService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
    }
}
