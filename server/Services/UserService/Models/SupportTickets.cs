using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class SupportTickets
    {
        [Key]
        public int SupportTicketsId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        [MaxLength(150)]
        public string Subject { get; set; }
        [Required]
        [MaxLength(1000)]
        public string Message { get; set; }
        [Required]
        [MaxLength(50)]
        public string Status { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}
