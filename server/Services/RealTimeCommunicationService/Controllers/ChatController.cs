using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TravelAssistant.Services.RealTimeCommunicationService.Hubs;
using TravelAssistant.Services.RealTimeCommunicationService.Interfaces;
using TravelAssistant.Services.RealTimeCommunicationService.Models;
using TravelAssistant.Services.RealTimeCommunicationService.Security;

namespace TravelAssistant.Services.RealTimeCommunicationService.Controllers;

[ApiController]
[Route("api/chat")]
[Route("api/v1/chat")]
[Authorize]
public sealed class ChatController : ControllerBase
{
    private const int AssistantUserId = 0;
    private readonly IChatService _chatService;
    private readonly IHubContext<ChatHub> _chatHub;

    public ChatController(IChatService chatService, IHubContext<ChatHub> chatHub)
    {
        _chatService = chatService;
        _chatHub = chatHub;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var data = await _chatService.GetAllAsync(cancellationToken);
        return Ok(data);
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var data = await _chatService.GetForUserAsync(userId.Value, cancellationToken);
        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateChatMessageRequest request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "Message is required." });

        var userMsg = new ChatMessage
        {
            SenderUserId = userId.Value,
            ReceiverUserId = AssistantUserId,
            Message = request.Message.Trim(),
            SentAt = DateTime.UtcNow
        };
        await _chatService.CreateAsync(userMsg, cancellationToken);

        var replyText = string.IsNullOrWhiteSpace(request.AiReply)
            ? "Thanks — our travel assistant will refine this in your itinerary."
            : request.AiReply.Trim();

        var aiMsg = new ChatMessage
        {
            SenderUserId = AssistantUserId,
            ReceiverUserId = userId.Value,
            Message = replyText,
            SentAt = DateTime.UtcNow
        };
        var created = await _chatService.CreateAsync(aiMsg, cancellationToken);

        await _chatHub.Clients.User(userId.Value.ToString()).SendAsync(
            ChatHub.NewMessageEventName,
            new { role = "assistant", text = created.Message, sentAt = created.SentAt },
            cancellationToken);

        return Ok(new { userMessage = userMsg, assistantMessage = created });
    }

    public sealed class CreateChatMessageRequest
    {
        public string Message { get; set; } = string.Empty;
        public string? AiReply { get; set; }
    }
}