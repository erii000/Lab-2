using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.BookingService.Models.Entities;

namespace TravelAssistant.Services.BookingService.Data;

public sealed class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Hotel> Hotels => Set<Hotel>();
    public DbSet<Flight> Flights => Set<Flight>();
    public DbSet<TransportOption> TransportOptions => Set<TransportOption>();
    public DbSet<SavedTrip> SavedTrips => Set<SavedTrip>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.ToTable("Bookings");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.BookingType).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Provider).HasMaxLength(100).IsRequired();
            entity.Property(x => x.ReferenceCode).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Amount).HasColumnType("decimal(10,2)");
            entity.Property(x => x.Currency).HasMaxLength(10);
            entity.Property(x => x.BookingDate).HasColumnType("date").IsRequired();
            entity.Property(x => x.Status).HasMaxLength(50).IsRequired();
            entity.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();
            entity.Property(x => x.UpdatedAt).HasColumnType("datetime");
            entity.HasIndex(x => x.UserId).HasDatabaseName("IX_Bookings_UserId");
        });

        modelBuilder.Entity<Hotel>(entity =>
        {
            entity.ToTable("Hotels");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Address).HasMaxLength(255);
            entity.Property(x => x.Rating).HasColumnType("decimal(2,1)");
            entity.Property(x => x.PricePerNight).HasColumnType("decimal(10,2)");
            entity.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();
            entity.Property(x => x.UpdatedAt).HasColumnType("datetime");
            entity.HasIndex(x => x.DestinationId).HasDatabaseName("IX_Hotels_DestinationId");
        });

        modelBuilder.Entity<Flight>(entity =>
        {
            entity.ToTable("Flights");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.FromCity).HasMaxLength(100).IsRequired();
            entity.Property(x => x.ToCity).HasMaxLength(100).IsRequired();
            entity.Property(x => x.DepartureDate).HasColumnType("datetime").IsRequired();
            entity.Property(x => x.ArrivalDate).HasColumnType("datetime").IsRequired();
            entity.Property(x => x.Airline).HasMaxLength(100);
            entity.Property(x => x.Price).HasColumnType("decimal(10,2)");
            entity.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();
            entity.Property(x => x.UpdatedAt).HasColumnType("datetime");
            entity.HasIndex(x => x.UserId).HasDatabaseName("IX_Flights_UserId");
        });

        modelBuilder.Entity<TransportOption>(entity =>
        {
            entity.ToTable("TransportOptions");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.TransportType).HasColumnName("Type").HasMaxLength(50).IsRequired();
            entity.Property(x => x.Provider).HasMaxLength(100);
            entity.Property(x => x.Price).HasColumnType("decimal(10,2)");
            entity.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();
            entity.Property(x => x.UpdatedAt).HasColumnType("datetime");
            entity.HasIndex(x => x.DestinationId).HasDatabaseName("IX_TransportOptions_DestinationId");
        });

        modelBuilder.Entity<SavedTrip>(entity =>
        {
            entity.ToTable("SavedTrips");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.SavedAt).HasColumnType("datetime").IsRequired();
            entity.HasIndex(x => x.UserId).HasDatabaseName("IX_SavedTrips_UserId");
            entity.HasIndex(x => x.TripId).HasDatabaseName("IX_SavedTrips_TripId");
        });
    }
}
