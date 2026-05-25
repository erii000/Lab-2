using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.ItineraryService.Models.Entities;

namespace TravelAssistant.Services.ItineraryService.Data;

public sealed class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Itinerary> Itineraries => Set<Itinerary>();
    public DbSet<ItineraryDay> ItineraryDays => Set<ItineraryDay>();
    public DbSet<ItineraryDayActivity> ItineraryDayActivities => Set<ItineraryDayActivity>();
    public DbSet<TravelPreference> TravelPreferences => Set<TravelPreference>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<Destination> Destinations => Set<Destination>();
    public DbSet<TripDestination> TripDestinations => Set<TripDestination>();
    public DbSet<TripParticipant> TripParticipants => Set<TripParticipant>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Itinerary>(entity =>
        {
            entity.ToTable("Itineraries");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Destination).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Country).HasMaxLength(100);
            entity.Property(x => x.Description).HasMaxLength(2000);
            entity.Property(x => x.StartDate).HasColumnType("date").IsRequired();
            entity.Property(x => x.EndDate).HasColumnType("date").IsRequired();
            entity.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();
            entity.Property(x => x.UpdatedAt).HasColumnType("datetime");
            entity.HasIndex(x => x.UserId).HasDatabaseName("IX_Itineraries_UserId");

            entity.HasMany(x => x.Days)
                .WithOne(x => x.Itinerary)
                .HasForeignKey(x => x.ItineraryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ItineraryDay>(entity =>
        {
            entity.ToTable("ItineraryDays");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.TransportSuggestion).HasMaxLength(200).IsRequired();
            entity.Property(x => x.MealSuggestion).HasMaxLength(200).IsRequired();
            entity.Property(x => x.CreatedAt).HasColumnType("datetime2").IsRequired();
            entity.HasIndex(x => x.ItineraryId).HasDatabaseName("IX_ItineraryDays_ItineraryId");

            entity.HasMany(x => x.Activities)
                .WithOne(x => x.ItineraryDay)
                .HasForeignKey(x => x.ItineraryDayId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ItineraryDayActivity>(entity =>
        {
            entity.ToTable("ItineraryDayActivities");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Description).HasMaxLength(500).IsRequired();
            entity.HasIndex(x => x.ItineraryDayId).HasDatabaseName("IX_ItineraryDayActivities_DayId");
        });

        modelBuilder.Entity<TravelPreference>(entity =>
        {
            entity.ToTable("TravelPreferences");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.PreferredTransport).HasMaxLength(100);
            entity.Property(x => x.PreferredAccommodation).HasMaxLength(100);
            entity.Property(x => x.BudgetMin).HasColumnType("decimal(10,2)");
            entity.Property(x => x.BudgetMax).HasColumnType("decimal(10,2)");
            entity.Property(x => x.FavoriteDestinationType).HasMaxLength(100);
            entity.Property(x => x.CreatedAt).HasColumnType("datetime2");
            entity.Property(x => x.UpdatedAt).HasColumnType("datetime2");
            entity.HasIndex(x => x.UserId).HasDatabaseName("IX_TravelPreferences_UserId");
        });

        modelBuilder.Entity<Trip>(entity =>
        {
            entity.ToTable("Trips");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(100).IsRequired();
            entity.Property(x => x.StartDate).HasColumnType("date").IsRequired();
            entity.Property(x => x.EndDate).HasColumnType("date").IsRequired();
            entity.Property(x => x.Budget).HasColumnType("decimal(10,2)");
            entity.Property(x => x.Status).HasMaxLength(50).IsRequired();
            entity.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();
            entity.Property(x => x.UpdatedAt).HasColumnType("datetime");
            entity.HasIndex(x => x.UserId).HasDatabaseName("IX_Trips_UserId");
        });

        modelBuilder.Entity<Destination>(entity =>
        {
            entity.ToTable("Destinations");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Slug).HasMaxLength(64).IsRequired();
            entity.HasIndex(x => x.Slug).IsUnique().HasDatabaseName("IX_Destinations_Slug");
            entity.Property(x => x.Name).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Country).HasMaxLength(100).IsRequired();
            entity.Property(x => x.City).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(2000);
            entity.Property(x => x.ImageUrl).HasMaxLength(500);
            entity.Property(x => x.PriceFrom).HasColumnType("decimal(10,2)");
            entity.Property(x => x.Rating).HasColumnType("decimal(3,1)");
            entity.Property(x => x.Tag).HasMaxLength(80);
            entity.Property(x => x.CatalogJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();
            entity.Property(x => x.UpdatedAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<TripDestination>(entity =>
        {
            entity.ToTable("TripDestinations");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.VisitDate).HasColumnType("date");
            entity.HasIndex(x => x.TripId).HasDatabaseName("IX_TripDestinations_TripId");
            entity.HasIndex(x => x.DestinationId).HasDatabaseName("IX_TripDestinations_DestinationId");

            entity.HasOne(x => x.Trip)
                .WithMany(x => x.TripDestinations)
                .HasForeignKey(x => x.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Destination)
                .WithMany(x => x.TripDestinations)
                .HasForeignKey(x => x.DestinationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TripParticipant>(entity =>
        {
            entity.ToTable("TripParticipants");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Role).HasMaxLength(50);
            entity.Property(x => x.JoinedAt).HasColumnType("datetime").IsRequired();
            entity.HasIndex(x => x.TripId).HasDatabaseName("IX_TripParticipants_TripId");
            entity.HasIndex(x => x.UserId).HasDatabaseName("IX_TripParticipants_UserId");

            entity.HasOne(x => x.Trip)
                .WithMany(x => x.TripParticipants)
                .HasForeignKey(x => x.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
