using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace TravelAssistant.Common.Notifications;

public sealed class HttpTravelUpdatePublisher : ITravelUpdatePublisher
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<HttpTravelUpdatePublisher> _logger;
    private readonly string? _internalKey;

    public HttpTravelUpdatePublisher(
        HttpClient httpClient,
        IOptions<TravelUpdatePublisherOptions> options,
        ILogger<HttpTravelUpdatePublisher> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _internalKey = options.Value.InternalKey;
        var baseUrl = options.Value.BaseUrl?.Trim();
        if (!string.IsNullOrWhiteSpace(baseUrl))
            _httpClient.BaseAddress = new Uri(baseUrl.EndsWith('/') ? baseUrl : baseUrl + "/");
    }

    public Task NotifyUserAsync(
        int userId,
        string title,
        string message,
        string type = "system",
        TravelUpdateContext? context = null,
        CancellationToken cancellationToken = default) =>
        PublishAsync(new
        {
            userId,
            title,
            message,
            type,
            broadcast = false,
            bookingId = context?.BookingId,
            travelerName = context?.TravelerName,
            destination = context?.Destination,
            targetUserId = context?.TargetUserId,
        }, cancellationToken);

    public Task BroadcastAsync(
        string title,
        string message,
        string type = "system",
        TravelUpdateContext? context = null,
        CancellationToken cancellationToken = default) =>
        PublishAsync(new
        {
            title,
            message,
            type,
            broadcast = true,
            bookingId = context?.BookingId,
            travelerName = context?.TravelerName,
            destination = context?.Destination,
            targetUserId = context?.TargetUserId,
        }, cancellationToken);

    private async Task PublishAsync(object payload, CancellationToken cancellationToken)
    {
        if (_httpClient.BaseAddress is null)
            return;

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "api/v1/notifications/internal/publish")
            {
                Content = JsonContent.Create(payload)
            };
            if (!string.IsNullOrWhiteSpace(_internalKey))
                request.Headers.TryAddWithoutValidation("X-Notification-Key", _internalKey);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
                _logger.LogWarning("Travel update publish failed: {Status}", response.StatusCode);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Travel update publish skipped");
        }
    }
}
