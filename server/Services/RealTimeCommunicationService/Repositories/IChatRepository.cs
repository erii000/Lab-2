using TravelAssistant.Services.RealTimeCommunicationService.Models;

namespace TravelAssistant.Services.RealTimeCommunicationService.Repositories;

public interface IChatRepository
{
    Task<IReadOnlyList<ChatMessage>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ChatMessage>> GetForUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ChatThreadSummary>> GetThreadsAsync(CancellationToken cancellationToken = default);
    Task<ChatMessage> AddAsync(ChatMessage message, CancellationToken cancellationToken = default);
}
