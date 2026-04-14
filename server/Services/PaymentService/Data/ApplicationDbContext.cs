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
    public DbSet<PaymentTransactionLog> PaymentTransactionLogs => Set<PaymentTransactionLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.ToTable("Payments");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Amount).HasColumnType("decimal(10,2)").IsRequired();
            entity.Property(x => x.Currency).HasMaxLength(10);
            entity.Property(x => x.PaymentMethod).HasMaxLength(50).IsRequired();
            entity.Property(x => x.PaymentStatus).HasMaxLength(50).IsRequired();
            entity.Property(x => x.ExternalReference).HasMaxLength(255);
            entity.Property(x => x.PaidAt).HasColumnType("datetime");
            entity.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();
            entity.HasIndex(x => x.UserId).HasDatabaseName("IX_Payments_UserId");
            entity.HasIndex(x => x.BookingId).HasDatabaseName("IX_Payments_BookingId");
            entity.HasIndex(x => x.ExternalReference).HasDatabaseName("IX_Payments_ExternalReference");
        });

        modelBuilder.Entity<PaymentTransactionLog>(entity =>
        {
            entity.ToTable("PaymentTransactionLogs");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Provider).HasMaxLength(50).IsRequired();
            entity.Property(x => x.ExternalEventId).HasMaxLength(100).IsRequired();
            entity.Property(x => x.EventType).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Payload);
            entity.Property(x => x.ErrorMessage).HasMaxLength(2000);
            entity.Property(x => x.CreatedAt).HasColumnType("datetime2").IsRequired();
            entity.HasIndex(x => x.ExternalEventId).IsUnique().HasDatabaseName("UX_PaymentTransactionLogs_ExternalEventId");

            entity.HasOne(x => x.Payment)
                .WithMany()
                .HasForeignKey(x => x.PaymentId)
                .OnDelete(DeleteBehavior.SetNull);
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
