using TravelAssistant.Services.SupportService.Models;

namespace TravelAssistant.Services.SupportService.Repositories;

public interface ISupportTicketRepository
{
    Task<IReadOnlyList<SupportTicket>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SupportTicket>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<SupportTicket> AddAsync(SupportTicket ticket, CancellationToken cancellationToken = default);
    Task<SupportTicket?> UpdateStatusAsync(int id, string status, CancellationToken cancellationToken = default);
}
