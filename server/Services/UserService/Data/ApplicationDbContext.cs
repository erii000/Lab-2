using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.UserService.Models.Entities;
using UserService.Models;

namespace TravelAssistant.Services.UserService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Roles> Roles { get; set; }
        public DbSet<UserRoles> UserRoles { get; set; }

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

            modelBuilder.Entity<Roles>(entity =>
            {
                entity.ToTable("Roles");
                entity.HasKey(x => x.RolesId);
                // Shared Azure lab2DB uses Id; EF migrations use RolesId.
                entity.Property(x => x.RolesId).HasColumnName("Id");
                entity.Property(x => x.Name).HasMaxLength(50).IsRequired();
                entity.Property(x => x.Description).HasMaxLength(255).IsRequired();
                entity.Property(x => x.CreatedAt).HasColumnType("datetime2").IsRequired();
            });

            modelBuilder.Entity<UserRoles>(entity =>
            {
                entity.ToTable("UserRoles");
                entity.HasKey(x => x.UserRoleId);
                entity.Property(x => x.UserRoleId).HasColumnName("Id");
                entity.Property(x => x.AssignedAt).HasColumnType("datetime2").IsRequired();

                entity.HasOne(x => x.User)
                    .WithMany(x => x.UserRoles)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.Role)
                    .WithMany()
                    .HasForeignKey(x => x.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
