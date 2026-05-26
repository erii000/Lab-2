using TravelAssistant.Services.NotificationService.Contracts.Notifications;
using TravelAssistant.Services.NotificationService.Interfaces;
using TravelAssistant.Services.NotificationService.Models;
using TravelAssistant.Services.NotificationService.Repositories;

namespace TravelAssistant.Services.NotificationService.Services;

public sealed class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;

    public NotificationService(INotificationRepository repository) => _repository = repository;

    public async Task<IEnumerable<Notification>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _repository.GetAllAsync(cancellationToken);

    public Task<Notification?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _repository.GetByIdAsync(id, cancellationToken);

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default) =>
        await _repository.GetByUserIdAsync(userId, cancellationToken);

    public async Task<PagedResult<Notification>> SearchAsync(NotificationSearchRequest request, CancellationToken cancellationToken = default)
    {
        var (items, total) = await _repository.SearchAsync(request, cancellationToken);
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize switch
        {
            < 1 => 20,
            > 100 => 100,
            _ => request.PageSize
        };

        return new PagedResult<Notification>
        {
            Items = items.ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            TotalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public Task<Notification?> MarkAsReadAsync(int id, CancellationToken cancellationToken = default) =>
        _repository.MarkAsReadAsync(id, cancellationToken);

    public Task<Notification> CreateAsync(Notification notification, CancellationToken cancellationToken = default) =>
        _repository.AddAsync(notification, cancellationToken);
}
