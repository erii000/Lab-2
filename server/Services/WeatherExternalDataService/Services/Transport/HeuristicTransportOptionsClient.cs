using TravelAssistant.Services.WeatherExternalDataService.DTOs.Transport;

namespace TravelAssistant.Services.WeatherExternalDataService.Services.Transport;

/// <summary>
/// Returns normalized ride/transit estimates using a Haversine distance heuristic.
/// Uber and public APIs require OAuth and city-specific partnerships; this client is provider-shaped for swap-in.
/// </summary>
public sealed class HeuristicTransportOptionsClient : ITransportOptionsClient
{
    public Task<IReadOnlyList<TransportOptionDto>> GetOptionsAsync(
        double fromLatitude,
        double fromLongitude,
        double toLatitude,
        double toLongitude,
        CancellationToken cancellationToken = default)
    {
        var km = HaversineKm(fromLatitude, fromLongitude, toLatitude, toLongitude);
        var uberMinutes = (int)Math.Clamp(Math.Round(km * 1.8 + 4), 5, 180);
        var transitMinutes = (int)Math.Clamp(Math.Round(km * 3.5 + 10), 10, 240);
        var uberPrice = Math.Round((decimal)(3.5 + km * 1.4), 2);
        var transitPrice = Math.Round((decimal)(1.2 + km * 0.08), 2);

        IReadOnlyList<TransportOptionDto> list = new[]
        {
            new TransportOptionDto
            {
                Provider = "Uber (estimate)",
                Mode = "rideshare",
                EstimatedMinutes = uberMinutes,
                EstimatedPrice = uberPrice,
                Currency = "USD"
            },
            new TransportOptionDto
            {
                Provider = "Local transit (estimate)",
                Mode = "public_transit",
                EstimatedMinutes = transitMinutes,
                EstimatedPrice = transitPrice,
                Currency = "USD"
            }
        };

        return Task.FromResult(list);
    }

    private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371.0;
        static double Rad(double deg) => deg * (Math.PI / 180.0);

        var dLat = Rad(lat2 - lat1);
        var dLon = Rad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(Rad(lat1)) * Math.Cos(Rad(lat2)) * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }
}
