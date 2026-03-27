using Microsoft.EntityFrameworkCore;
using SmartTravelAssistant.API.Models.Entities; // Ensure this matches your folder path

namespace SmartTravelAssistant.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
    }
}