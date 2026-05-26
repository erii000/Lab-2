using TravelAssistant.Services.SupportService.Interfaces;
using TravelAssistant.Services.SupportService.Models;
using TravelAssistant.Services.SupportService.Repositories;

namespace TravelAssistant.Services.SupportService.Services;

public sealed class SupportTicketService : ISupportTicketService
{
    private readonly ISupportTicketRepository _repository;

    public SupportTicketService(ISupportTicketRepository repository) => _repository = repository;

    public async Task<IEnumerable<SupportTicket>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _repository.GetAllAsync(cancellationToken);

    public async Task<IEnumerable<SupportTicket>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default) =>
        await _repository.GetByUserIdAsync(userId, cancellationToken);

    public Task<SupportTicket> CreateAsync(SupportTicket ticket, CancellationToken cancellationToken = default) =>
        _repository.AddAsync(ticket, cancellationToken);

    public Task<SupportTicket?> UpdateStatusAsync(int id, string status, CancellationToken cancellationToken = default) =>
        _repository.UpdateStatusAsync(id, status, cancellationToken);
}
