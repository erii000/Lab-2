using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.SupportService.Data;
using TravelAssistant.Services.SupportService.Interfaces;
using TravelAssistant.Services.SupportService.Models;

namespace TravelAssistant.Services.SupportService.Services
{
    public sealed class SupportTicketService : ISupportTicketService
    {
        private readonly ApplicationDbContext _context;

        public SupportTicketService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SupportTicket>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SupportTickets
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<SupportTicket>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.SupportTickets
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<SupportTicket> CreateAsync(SupportTicket ticket, CancellationToken cancellationToken = default)
        {
            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync(cancellationToken);
            return ticket;
        }

        public async Task<SupportTicket?> UpdateStatusAsync(int id, string status, CancellationToken cancellationToken = default)
        {
            var ticket = await _context.SupportTickets.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (ticket == null) return null;

            ticket.Status = status;
            await _context.SaveChangesAsync(cancellationToken);
            return ticket;
        }
    }
}