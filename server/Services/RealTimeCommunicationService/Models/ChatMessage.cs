namespace TravelAssistant.Services.RealTimeCommunicationService.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public int SenderUserId { get; set; }
        public int ReceiverUserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        /// <summary>Legacy lab DB column (NOT NULL FK) — traveler thread owner.</summary>
        public int UserId { get; set; }
    }
}