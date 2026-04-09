using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.UserService.Models.Entities;

namespace TravelAssistant.Services.UserService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(x => x.Id);
                entity.Property(x => x.FirstName).HasMaxLength(50).IsRequired();
                entity.Property(x => x.LastName).HasMaxLength(50).IsRequired();
                entity.Property(x => x.Email).HasMaxLength(100).IsRequired();
                entity.Property(x => x.PasswordHash).HasMaxLength(255).IsRequired();
                entity.Property(x => x.IsActive).IsRequired();
                entity.Property(x => x.CreatedAt).HasColumnType("datetime");
                entity.Property(x => x.UpdatedAt).HasColumnType("datetime");

                entity.HasIndex(x => x.Email).IsUnique();
            });

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.ToTable("RefreshTokens");
                entity.HasKey(x => x.Id);
                entity.Property(x => x.TokenHash).HasMaxLength(255).IsRequired();
                entity.Property(x => x.ExpiresAt).HasColumnType("datetime").IsRequired();
                entity.Property(x => x.RevokedAt).HasColumnType("datetime");
                entity.Property(x => x.CreatedAt).HasColumnType("datetime");

                entity.HasOne(x => x.User)
                    .WithMany(x => x.RefreshTokens)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
