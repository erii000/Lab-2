using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class ChatMessages
    {
        [Key]
        public int ChatMessageId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        [MaxLength(1000)]
        public string Message { get; set; }
        [Required]
        public DateTime SentAt { get; set; } = DateTime.Now;
        [Required]
        public bool IsRead { get; set; } = false;

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}
