using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.SignalR;

using TravelAssistant.Common.Notifications;

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

    private readonly ITravelUpdatePublisher _travelUpdatePublisher;



    public ChatController(

        IChatService chatService,

        IHubContext<ChatHub> chatHub,

        ITravelUpdatePublisher travelUpdatePublisher)

    {

        _chatService = chatService;

        _chatHub = chatHub;

        _travelUpdatePublisher = travelUpdatePublisher;

    }



    [HttpGet]

    [Authorize(Roles = "Admin,Support")]

    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)

    {

        var data = await _chatService.GetAllAsync(cancellationToken);

        return Ok(data);

    }



    [HttpGet("threads")]

    [Authorize(Roles = "Admin,Support")]

    public async Task<IActionResult> GetThreads(CancellationToken cancellationToken)

    {

        var threads = await _chatService.GetThreadsAsync(cancellationToken);

        return Ok(threads);

    }



    [HttpGet("user/{userId:int}")]

    [Authorize(Roles = "Admin,Support")]

    public async Task<IActionResult> GetUserThread(int userId, CancellationToken cancellationToken)

    {

        var data = await _chatService.GetForUserAsync(userId, cancellationToken);

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

            UserId = userId.Value,

            Message = request.Message.Trim(),

            SentAt = DateTime.UtcNow

        };

        await _chatService.CreateAsync(userMsg, cancellationToken);



        var payload = new

        {

            role = "user",

            text = userMsg.Message,

            userId = userId.Value,

            sentAt = userMsg.SentAt

        };



        await _chatHub.Clients.User(userId.Value.ToString()).SendAsync(

            ChatHub.NewMessageEventName,

            payload,

            cancellationToken);



        await _chatHub.Clients.Group(ChatHub.SupportAgentsGroup).SendAsync(

            ChatHub.NewMessageEventName,

            payload,

            cancellationToken);



        var preview = userMsg.Message.Length > 100 ? userMsg.Message[..97] + "…" : userMsg.Message;

        await _travelUpdatePublisher.BroadcastAsync(

            "Live chat message",

            $"User #{userId.Value} · {preview}",

            "support",

            new TravelUpdateContext { TargetUserId = userId.Value },

            cancellationToken);



        if (!string.IsNullOrWhiteSpace(request.AiReply))

        {

            var replyText = request.AiReply.Trim();

            var aiMsg = new ChatMessage

            {

                SenderUserId = AssistantUserId,

                ReceiverUserId = userId.Value,

                UserId = userId.Value,

                Message = replyText,

                SentAt = DateTime.UtcNow

            };

            var created = await _chatService.CreateAsync(aiMsg, cancellationToken);



            var assistantPayload = new { role = "assistant", text = created.Message, sentAt = created.SentAt };

            await _chatHub.Clients.User(userId.Value.ToString()).SendAsync(

                ChatHub.NewMessageEventName,

                assistantPayload,

                cancellationToken);



            return Ok(new { userMessage = userMsg, assistantMessage = created });

        }



        return Ok(new { userMessage = userMsg, awaitingHumanReply = true });

    }



    [HttpPost("user/{userId:int}/reply")]

    [Authorize(Roles = "Admin,Support")]

    public async Task<IActionResult> ReplyToUser(int userId, [FromBody] AdminReplyRequest request, CancellationToken cancellationToken)

    {

        if (string.IsNullOrWhiteSpace(request.Message))

            return BadRequest(new { error = "Message is required." });



        var adminMsg = new ChatMessage

        {

            SenderUserId = AssistantUserId,

            ReceiverUserId = userId,

            UserId = userId,

            Message = request.Message.Trim(),

            SentAt = DateTime.UtcNow

        };

        var created = await _chatService.CreateAsync(adminMsg, cancellationToken);



        var payload = new { role = "support", text = created.Message, userId, sentAt = created.SentAt };



        await _chatHub.Clients.User(userId.ToString()).SendAsync(

            ChatHub.NewMessageEventName,

            payload,

            cancellationToken);



        await _chatHub.Clients.Group(ChatHub.SupportAgentsGroup).SendAsync(

            ChatHub.NewMessageEventName,

            payload,

            cancellationToken);



        var preview = created.Message.Length > 120 ? created.Message[..117] + "…" : created.Message;

        await _travelUpdatePublisher.NotifyUserAsync(

            userId,

            "Support replied",

            preview,

            "support",

            cancellationToken: cancellationToken);



        return Ok(created);

    }



    public sealed class CreateChatMessageRequest

    {

        public string Message { get; set; } = string.Empty;

        public string? AiReply { get; set; }

    }



    public sealed class AdminReplyRequest

    {

        public string Message { get; set; } = string.Empty;

    }

}


