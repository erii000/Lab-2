using Microsoft.AspNetCore.SignalR;
using TravelAssistant.Services.NotificationService.Contracts.Notifications;
using TravelAssistant.Services.NotificationService.Services.Interfaces;
using TravelAssistant.Services.RealTimeCommunicationService.Hubs;

namespace TravelAssistant.Services.NotificationService.Services;

public sealed class RealtimeNotificationService : IRealtimeNotificationService
{
    private readonly IHubContext<NotificationsHub> _hubContext;

    public RealtimeNotificationService(IHubContext<NotificationsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task BroadcastTravelUpdateAsync(
        string title,
        string message,
        string type,
        int? bookingId = null,
        string? travelerName = null,
        string? destination = null,
        int? targetUserId = null,
        CancellationToken cancellationToken = default)
    {
        var payload = CreatePayload(title, message, type, null, bookingId, travelerName, destination, targetUserId);
        return _hubContext.Clients.All.SendAsync(NotificationsHub.TravelUpdateEventName, payload, cancellationToken);
    }

    public Task SendUserTravelUpdateAsync(
        int userId,
        string title,
        string message,
        string type,
        int? bookingId = null,
        string? travelerName = null,
        string? destination = null,
        int? targetUserId = null,
        CancellationToken cancellationToken = default)
    {
        var payload = CreatePayload(title, message, type, userId, bookingId, travelerName, destination, targetUserId);
        return _hubContext.Clients.User(userId.ToString()).SendAsync(NotificationsHub.TravelUpdateEventName, payload, cancellationToken);
    }

    private static NotificationRealtimePayload CreatePayload(
        string title,
        string message,
        string type,
        int? userId = null,
        int? bookingId = null,
        string? travelerName = null,
        string? destination = null,
        int? targetUserId = null)
    {
        return new NotificationRealtimePayload
        {
            UserId = userId,
            Audience = userId is null ? "admin" : null,
            Title = title,
            Message = message,
            Type = type,
            BookingId = bookingId,
            TravelerName = travelerName,
            Destination = destination,
            TargetUserId = targetUserId,
            SentAtUtc = DateTime.UtcNow
        };
    }
}
