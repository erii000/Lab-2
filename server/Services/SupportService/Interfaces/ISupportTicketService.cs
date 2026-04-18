using TravelAssistant.Services.SupportService.Models;

namespace TravelAssistant.Services.SupportService.Interfaces
{
    public interface ISupportTicketService
    {
        Task<IEnumerable<SupportTicket>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<SupportTicket>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
        Task<SupportTicket> CreateAsync(SupportTicket ticket, CancellationToken cancellationToken = default);
        Task<SupportTicket?> UpdateStatusAsync(int id, string status, CancellationToken cancellationToken = default);
    }
}