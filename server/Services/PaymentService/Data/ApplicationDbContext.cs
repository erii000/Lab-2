using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.PaymentService.Models.Entities;

namespace TravelAssistant.Services.PaymentService.Data;

public sealed class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Expense> Expenses => Set<Expense>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.ToTable("Payments");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Amount).HasColumnType("decimal(10,2)").IsRequired();
            entity.Property(x => x.PaymentMethod).HasMaxLength(50).IsRequired();
            entity.Property(x => x.PaymentStatus).HasMaxLength(50).IsRequired();
            entity.Property(x => x.PaidAt).HasColumnType("datetime");
            entity.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();
            entity.HasIndex(x => x.UserId).HasDatabaseName("IX_Payments_UserId");
            entity.HasIndex(x => x.BookingId).HasDatabaseName("IX_Payments_BookingId");
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.ToTable("Expenses");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Category).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Amount).HasColumnType("decimal(10,2)").IsRequired();
            entity.Property(x => x.Description).HasMaxLength(255);
            entity.Property(x => x.ExpenseDate).HasColumnType("date").IsRequired();
            entity.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();
            entity.HasIndex(x => x.TripId).HasDatabaseName("IX_Expenses_TripId");
            entity.HasIndex(x => x.UserId).HasDatabaseName("IX_Expenses_UserId");
        });
    }
}
