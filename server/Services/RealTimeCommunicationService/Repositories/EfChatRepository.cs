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
            .Where(x => x.SenderUserId == userId || x.ReceiverUserId == userId || x.UserId == userId)
            .OrderBy(x => x.SentAt)
            .Take(200)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ChatThreadSummary>> GetThreadsAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _context.ChatMessages.AsNoTracking().ToListAsync(cancellationToken);
        return rows
            .Select(m => m.SenderUserId == 0 ? (m.ReceiverUserId > 0 ? m.ReceiverUserId : m.UserId) : m.SenderUserId)
            .Where(id => id > 0)
            .Distinct()
            .Select(userId =>
            {
                var thread = rows.Where(m => m.SenderUserId == userId || m.ReceiverUserId == userId || m.UserId == userId)
                    .OrderByDescending(m => m.SentAt)
                    .ToList();
                var last = thread[0];
                return new ChatThreadSummary
                {
                    UserId = userId,
                    LastMessage = last.Message,
                    LastSentAt = last.SentAt,
                    MessageCount = thread.Count
                };
            })
            .OrderByDescending(t => t.LastSentAt)
            .ToList();
    }

    public async Task<ChatMessage> AddAsync(ChatMessage message, CancellationToken cancellationToken = default)
    {
        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);
        return message;
    }
}
