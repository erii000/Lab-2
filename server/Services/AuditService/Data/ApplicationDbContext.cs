using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.AuditService.Models;

namespace TravelAssistant.Services.AuditService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<AuditLog> AuditLogs { get; set; }
    }
}