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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs");
                entity.HasKey(x => x.Id);
                entity.Property(x => x.Action).HasMaxLength(100).IsRequired();
                entity.Property(x => x.EntityName).HasMaxLength(50).IsRequired();
                entity.Property(x => x.Details).HasMaxLength(2000);
                entity.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();
                entity.HasIndex(x => x.UserId).HasDatabaseName("IX_AuditLogs_UserId");
                entity.HasIndex(x => x.EntityName).HasDatabaseName("IX_AuditLogs_EntityName");
                entity.HasIndex(x => x.CreatedAt).HasDatabaseName("IX_AuditLogs_CreatedAt");
            });
        }
    }
}
