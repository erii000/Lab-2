using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.SupportService.Data;
using TravelAssistant.Services.SupportService.Models;

namespace TravelAssistant.Services.SupportService.Repositories;

public sealed class EfSupportTicketRepository : ISupportTicketRepository
{
    private readonly ApplicationDbContext _context;

    public EfSupportTicketRepository(ApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<SupportTicket>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.SupportTickets.OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<SupportTicket>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default) =>
        await _context.SupportTickets.Where(x => x.UserId == userId).OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);

    public async Task<SupportTicket> AddAsync(SupportTicket ticket, CancellationToken cancellationToken = default)
    {
        _context.SupportTickets.Add(ticket);
        await _context.SaveChangesAsync(cancellationToken);
        return ticket;
    }

    public async Task<SupportTicket?> UpdateStatusAsync(int id, string status, CancellationToken cancellationToken = default)
    {
        var ticket = await _context.SupportTickets.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (ticket is null)
            return null;

        ticket.Status = status;
        await _context.SaveChangesAsync(cancellationToken);
        return ticket;
    }
}
