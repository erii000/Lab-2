using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using TravelAssistant.Services.WeatherExternalDataService.Configuration;
using TravelAssistant.Services.WeatherExternalDataService.DTOs.Transport;

namespace TravelAssistant.Services.WeatherExternalDataService.Services.Transport;

/// <summary>
/// Uses a configured external transport provider when available, otherwise falls back to local heuristic estimates.
/// </summary>
public sealed class HybridTransportOptionsClient : ITransportOptionsClient
{
    private readonly HttpClient _httpClient;
    private readonly TransportApiOptions _options;
    private readonly HeuristicTransportOptionsClient _fallback = new();

    public HybridTransportOptionsClient(HttpClient httpClient, IOptions<TransportApiOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<IReadOnlyList<TransportOptionDto>> GetOptionsAsync(
        double fromLatitude,
        double fromLongitude,
        double toLatitude,
        double toLongitude,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.BaseUrl))
        {
            return await _fallback.GetOptionsAsync(fromLatitude, fromLongitude, toLatitude, toLongitude, cancellationToken);
        }

        var uri =
            $"v1/options?fromLat={fromLatitude}&fromLon={fromLongitude}&toLat={toLatitude}&toLon={toLongitude}";
        using var request = new HttpRequestMessage(HttpMethod.Get, uri);
        if (!string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            request.Headers.TryAddWithoutValidation("X-API-Key", _options.ApiKey);
            request.Headers.TryAddWithoutValidation("Authorization", $"Bearer {_options.ApiKey}");
        }

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException($"Transport provider failed with {(int)response.StatusCode}.");

        var payload = await response.Content.ReadFromJsonAsync<TransportProviderResponse>(cancellationToken: cancellationToken);
        if (payload?.Options is null || payload.Options.Count == 0)
            throw new InvalidOperationException("Transport provider returned no options.");

        return payload.Options
            .Where(x => !string.IsNullOrWhiteSpace(x.Mode))
            .Select(x => new TransportOptionDto
            {
                Provider = string.IsNullOrWhiteSpace(x.Provider) ? "TransportProvider" : x.Provider!,
                Mode = x.Mode!,
                EstimatedMinutes = Math.Max(1, x.EstimatedMinutes),
                EstimatedPrice = Math.Max(0, x.EstimatedPrice),
                Currency = string.IsNullOrWhiteSpace(x.Currency) ? "USD" : x.Currency!.ToUpperInvariant()
            })
            .ToList();
    }

    private sealed class TransportProviderResponse
    {
        [JsonPropertyName("options")]
        public List<TransportProviderOption> Options { get; set; } = [];
    }

    private sealed class TransportProviderOption
    {
        [JsonPropertyName("provider")]
        public string? Provider { get; set; }

        [JsonPropertyName("mode")]
        public string? Mode { get; set; }

        [JsonPropertyName("estimatedMinutes")]
        public int EstimatedMinutes { get; set; }

        [JsonPropertyName("estimatedPrice")]
        public decimal EstimatedPrice { get; set; }

        [JsonPropertyName("currency")]
        public string? Currency { get; set; }
    }
}
