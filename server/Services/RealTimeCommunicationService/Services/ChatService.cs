using TravelAssistant.Services.RealTimeCommunicationService.Interfaces;
using TravelAssistant.Services.RealTimeCommunicationService.Models;
using TravelAssistant.Services.RealTimeCommunicationService.Repositories;

namespace TravelAssistant.Services.RealTimeCommunicationService.Services;

public sealed class ChatService : IChatService
{
    private readonly IChatRepository _repository;

    public ChatService(IChatRepository repository) => _repository = repository;

    public async Task<IEnumerable<ChatMessage>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _repository.GetAllAsync(cancellationToken);

    public async Task<IEnumerable<ChatMessage>> GetForUserAsync(int userId, CancellationToken cancellationToken = default) =>
        await _repository.GetForUserAsync(userId, cancellationToken);

    public async Task<IEnumerable<ChatThreadSummary>> GetThreadsAsync(CancellationToken cancellationToken = default) =>
        await _repository.GetThreadsAsync(cancellationToken);

    public Task<ChatMessage> CreateAsync(ChatMessage chatMessage, CancellationToken cancellationToken = default) =>
        _repository.AddAsync(chatMessage, cancellationToken);
}
