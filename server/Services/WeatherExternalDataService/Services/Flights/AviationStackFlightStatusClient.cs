using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TravelAssistant.Services.WeatherExternalDataService.Configuration;
using TravelAssistant.Services.WeatherExternalDataService.DTOs.Flights;

namespace TravelAssistant.Services.WeatherExternalDataService.Services.Flights;

public sealed class AviationStackFlightStatusClient : IFlightStatusClient
{
    private readonly HttpClient _httpClient;
    private readonly AviationStackOptions _options;

    public AviationStackFlightStatusClient(HttpClient httpClient, IOptions<AviationStackOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<FlightStatusDto> GetByFlightNumberAsync(
        string flightNumber,
        DateOnly? flightDate,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.AccessKey))
            throw new InvalidOperationException("AviationStack access key is not configured (ExternalApis:AviationStack:AccessKey).");

        var iata = flightNumber.Trim().ToUpperInvariant();
        var query = $"flights?access_key={Uri.EscapeDataString(_options.AccessKey)}&flight_iata={Uri.EscapeDataString(iata)}";
        if (flightDate is not null)
            query += $"&flight_date={flightDate.Value:yyyy-MM-dd}";

        using var response = await _httpClient.GetAsync(query, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var err = doc.RootElement.TryGetProperty("error", out var e) ? e.GetRawText() : response.ReasonPhrase;
            throw new HttpRequestException($"AviationStack request failed: {(int)response.StatusCode} {err}");
        }

        if (!doc.RootElement.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Array || data.GetArrayLength() == 0)
            throw new InvalidOperationException($"No flight data returned for '{iata}'.");

        var flight = data[0];
        var airline = flight.TryGetProperty("airline", out var al) && al.TryGetProperty("name", out var aln) ? aln.GetString() : null;
        var dep = flight.TryGetProperty("departure", out var d) ? d : default;
        var arr = flight.TryGetProperty("arrival", out var a) ? a : default;
        var status = flight.TryGetProperty("flight_status", out var st) ? st.GetString() : null;

        return new FlightStatusDto
        {
            FlightNumber = iata,
            Airline = airline,
            DepartureAirport = dep.ValueKind == JsonValueKind.Object && dep.TryGetProperty("iata", out var di) ? di.GetString() : null,
            ArrivalAirport = arr.ValueKind == JsonValueKind.Object && arr.TryGetProperty("iata", out var ai) ? ai.GetString() : null,
            ScheduledDepartureUtc = ReadUtc(dep, "scheduled"),
            EstimatedDepartureUtc = ReadUtc(dep, "estimated"),
            Status = status
        };
    }

    private static DateTime? ReadUtc(JsonElement parent, string field)
    {
        if (parent.ValueKind != JsonValueKind.Object || !parent.TryGetProperty(field, out var v))
            return null;

        var s = v.GetString();
        return DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out var dt)
            ? dt
            : null;
    }
}
