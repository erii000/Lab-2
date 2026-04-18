namespace TravelAssistant.Services.SupportService.Models
{
    public class SupportTicket
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "Open";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}