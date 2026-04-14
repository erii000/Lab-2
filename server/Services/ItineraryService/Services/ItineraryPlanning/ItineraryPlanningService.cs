using System.Text.Json;
using TravelAssistant.Services.ItineraryService.DTOs.Itineraries;
using TravelAssistant.Services.ItineraryService.Models.Entities;
using TravelAssistant.Services.ItineraryService.Repositories;

namespace TravelAssistant.Services.ItineraryService.Services.ItineraryPlanning;

public sealed class ItineraryPlanningService : IItineraryPlanningService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = false };
    private readonly IItineraryRepository _itineraryRepository;
    private readonly ITravelPreferenceReader _travelPreferenceReader;

    public ItineraryPlanningService(
        IItineraryRepository itineraryRepository,
        ITravelPreferenceReader travelPreferenceReader)
    {
        _itineraryRepository = itineraryRepository;
        _travelPreferenceReader = travelPreferenceReader;
    }

    public async Task<GenerateItineraryResponse> GenerateAsync(
        int userId,
        GenerateItineraryRequest request,
        CancellationToken cancellationToken = default)
    {
        var preferences = await _travelPreferenceReader.GetLatestForUserAsync(userId, cancellationToken);
        var city = request.Destination.Trim();
        var country = string.IsNullOrWhiteSpace(request.Country) ? null : request.Country.Trim();

        var itinerary = new Itinerary
        {
            UserId = userId,
            Title = string.IsNullOrWhiteSpace(request.TripTitle)
                ? $"{city} · {request.StartDate:yyyy-MM-dd}–{request.EndDate:yyyy-MM-dd}"
                : request.TripTitle.Trim(),
            Destination = city,
            Country = country,
            Description = BuildPreferenceSnapshotJson(request, preferences),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var dayNumber = 1;
        for (var day = request.StartDate; day <= request.EndDate; day = day.AddDays(1))
        {
            var planned = PlanDay(city, dayNumber, day, preferences, request);
            var dayEntity = new ItineraryDay
            {
                DayNumber = dayNumber,
                Date = day,
                TransportSuggestion = planned.Transport,
                MealSuggestion = string.Join('|', planned.Meals),
                CreatedAt = DateTime.UtcNow
            };

            var order = 0;
            foreach (var activity in planned.Activities)
            {
                dayEntity.Activities.Add(new ItineraryDayActivity
                {
                    SortOrder = ++order,
                    Description = activity
                });
            }

            itinerary.Days.Add(dayEntity);
            dayNumber++;
        }

        await _itineraryRepository.AddAsync(itinerary, cancellationToken);
        await _itineraryRepository.SaveChangesAsync(cancellationToken);

        return new GenerateItineraryResponse
        {
            Id = itinerary.Id,
            UserId = userId,
            Destination = city,
            Days = MapDayDtos(itinerary.Days.OrderBy(d => d.DayNumber).ToList())
        };
    }

    public async Task<ItineraryDetailResponse?> GetByIdAsync(
        int itineraryId,
        int requestingUserId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var entity = await _itineraryRepository.GetWithDaysAsync(itineraryId, cancellationToken);
        if (entity is null)
            return null;

        if (!isAdmin && entity.UserId != requestingUserId)
            return null;

        return MapDetail(entity);
    }

    public async Task<IReadOnlyList<ItinerarySummaryDto>> ListForUserAsync(
        int targetUserId,
        int requestingUserId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        if (!isAdmin && targetUserId != requestingUserId)
            return Array.Empty<ItinerarySummaryDto>();

        var rows = await _itineraryRepository.ListForUserAsync(targetUserId, cancellationToken);
        return rows
            .Select(x => new ItinerarySummaryDto
            {
                Id = x.Id,
                Title = x.Title,
                Destination = x.Destination,
                StartDate = x.StartDate,
                EndDate = x.EndDate
            })
            .ToList();
    }

    private static ItineraryDetailResponse MapDetail(Itinerary entity)
    {
        TravelPreferenceSnapshotDto? prefs = null;
        if (!string.IsNullOrWhiteSpace(entity.Description))
        {
            try
            {
                var snap = JsonSerializer.Deserialize<PreferenceSnapshot>(entity.Description, JsonOptions);
                if (snap?.TravelPreference is not null)
                {
                    var tp = snap.TravelPreference;
                    prefs = new TravelPreferenceSnapshotDto
                    {
                        PreferredTransport = tp.PreferredTransport,
                        PreferredAccommodation = tp.PreferredAccommodation,
                        BudgetMin = tp.BudgetMin,
                        BudgetMax = tp.BudgetMax,
                        FavoriteDestinationType = tp.FavoriteDestinationType
                    };
                }
            }
            catch (JsonException)
            {
                // Legacy Description text — ignore snapshot.
            }
        }

        return new ItineraryDetailResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            Destination = entity.Destination,
            Country = entity.Country,
            Title = entity.Title,
            StoredSummary = entity.Description,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            Days = MapDayDtos(entity.Days.OrderBy(d => d.DayNumber).ToList()),
            PreferencesUsed = prefs
        };
    }

    private static IReadOnlyList<ItineraryDayDto> MapDayDtos(IReadOnlyList<ItineraryDay> days)
    {
        return days
            .Select(d => new ItineraryDayDto
            {
                Day = d.DayNumber,
                Date = d.Date,
                Activities = d.Activities.OrderBy(a => a.SortOrder).Select(a => a.Description).ToList(),
                Transport = d.TransportSuggestion,
                Meals = string.IsNullOrWhiteSpace(d.MealSuggestion)
                    ? Array.Empty<string>()
                    : d.MealSuggestion.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            })
            .ToList();
    }

    private static string? BuildPreferenceSnapshotJson(GenerateItineraryRequest request, TravelPreference? preferences)
    {
        var snapshot = new PreferenceSnapshot
        {
            Request = new RequestSnapshot
            {
                BudgetLevel = request.BudgetLevel,
                TransportMode = request.TransportMode
            },
            TravelPreference = preferences is null
                ? null
                : new TravelPreferenceSnapshot
                {
                    PreferredTransport = preferences.PreferredTransport,
                    PreferredAccommodation = preferences.PreferredAccommodation,
                    BudgetMin = preferences.BudgetMin,
                    BudgetMax = preferences.BudgetMax,
                    FavoriteDestinationType = preferences.FavoriteDestinationType
                }
        };

        return JsonSerializer.Serialize(snapshot, JsonOptions);
    }

    private static PlannedDay PlanDay(
        string city,
        int dayNumber,
        DateOnly date,
        TravelPreference? preferences,
        GenerateItineraryRequest request)
    {
        var key = city.ToLowerInvariant();
        var pool = LandmarkPools.TryGetValue(key, out var list)
            ? list
            : LandmarkPools["default"];

        var transportHint = ResolveTransport(preferences, request);
        var accommodationHint = preferences?.PreferredAccommodation?.Trim();

        var activities = new List<string>
        {
            $"{city} — day {dayNumber} core plan",
            PickRotating(pool, dayNumber),
            PickRotating(pool, dayNumber + 3)
        };

        if (!string.IsNullOrWhiteSpace(accommodationHint))
            activities.Add($"Stay style: {accommodationHint}");

        var transport = transportHint switch
        {
            "public" or "transit" => "Public transit + walking",
            "car" or "drive" => "Rental car / rideshare mix",
            "walk" or "walking" => "Walking-focused day",
            _ => "Mix of walking and local transport"
        };

        var meals = new List<string>
        {
            $"Breakfast near your {accommodationHint ?? "stay"}",
            $"Lunch — local cuisine in {city}",
            $"Dinner — reservation recommended (day {dayNumber})"
        };

        if (!string.IsNullOrWhiteSpace(request.BudgetLevel))
            activities.Add($"Budget pacing: {request.BudgetLevel}");

        return new PlannedDay(activities.Distinct(StringComparer.OrdinalIgnoreCase).ToList(), transport, meals);
    }

    private static string ResolveTransport(TravelPreference? preferences, GenerateItineraryRequest request)
    {
        var fromRequest = request.TransportMode?.Trim().ToLowerInvariant();
        if (!string.IsNullOrEmpty(fromRequest))
            return fromRequest;

        var fromProfile = preferences?.PreferredTransport?.Trim().ToLowerInvariant();
        return string.IsNullOrEmpty(fromProfile) ? "mixed" : fromProfile;
    }

    private static string PickRotating(IReadOnlyList<string> pool, int seed) =>
        pool[Math.Abs(seed) % pool.Count];

    private static readonly Dictionary<string, string[]> LandmarkPools = new(StringComparer.OrdinalIgnoreCase)
    {
        ["rome"] = new[] { "Colosseum & Roman Forum", "Vatican Museums", "Trastevere evening stroll", "Pantheon", "Borghese Gallery" },
        ["paris"] = new[] { "Louvre highlights", "Seine walk", "Montmartre", "Musée d'Orsay", "Le Marais food walk" },
        ["london"] = new[] { "British Museum", "South Bank walk", "Tower of London", "Westminster", "Covent Garden" },
        ["default"] = new[] { "Historic quarter walk", "Local museum", "Waterfront / old town", "Neighborhood market", "Sunset viewpoint" }
    };

    private sealed record PlannedDay(IReadOnlyList<string> Activities, string Transport, IReadOnlyList<string> Meals);

    private sealed class PreferenceSnapshot
    {
        public RequestSnapshot? Request { get; set; }
        public TravelPreferenceSnapshot? TravelPreference { get; set; }
    }

    private sealed class RequestSnapshot
    {
        public string? BudgetLevel { get; set; }
        public string? TransportMode { get; set; }
    }

    private sealed class TravelPreferenceSnapshot
    {
        public string? PreferredTransport { get; set; }
        public string? PreferredAccommodation { get; set; }
        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }
        public string? FavoriteDestinationType { get; set; }
    }
}
