using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.RealTimeCommunicationService.Data;
using TravelAssistant.Services.RealTimeCommunicationService.Models;

namespace TravelAssistant.Services.RealTimeCommunicationService.Repositories;

public sealed class EfChatRepository : IChatRepository
{
    private readonly ApplicationDbContext _context;

    public EfChatRepository(ApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<ChatMessage>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.ChatMessages.OrderByDescending(x => x.SentAt).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ChatMessage>> GetForUserAsync(int userId, CancellationToken cancellationToken = default) =>
        await _context.ChatMessages
            .AsNoTracking()
            .Where(x => x.SenderUserId == userId || x.ReceiverUserId == userId)
            .OrderBy(x => x.SentAt)
            .Take(200)
            .ToListAsync(cancellationToken);

    public async Task<ChatMessage> AddAsync(ChatMessage message, CancellationToken cancellationToken = default)
    {
        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);
        return message;
    }
}
