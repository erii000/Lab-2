using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.RealTimeCommunicationService.Data;
using TravelAssistant.Services.RealTimeCommunicationService.Interfaces;
using TravelAssistant.Services.RealTimeCommunicationService.Models;

namespace TravelAssistant.Services.RealTimeCommunicationService.Services
{
    public sealed class ChatService : IChatService
    {
        private readonly ApplicationDbContext _context;

        public ChatService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChatMessage>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.ChatMessages
                .OrderByDescending(x => x.SentAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<ChatMessage> CreateAsync(ChatMessage chatMessage, CancellationToken cancellationToken = default)
        {
            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync(cancellationToken);
            return chatMessage;
        }
    }
}