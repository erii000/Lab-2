using TravelAssistant.Services.RealTimeCommunicationService.Models;

namespace TravelAssistant.Services.RealTimeCommunicationService.Interfaces
{
    public interface IChatService
    {
        Task<IEnumerable<ChatMessage>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<ChatMessage> CreateAsync(ChatMessage chatMessage, CancellationToken cancellationToken = default);
    }
}