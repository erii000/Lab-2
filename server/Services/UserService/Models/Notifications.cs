using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class Notifications
    {
        [Key]
        public int NotificationId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Title { get; set; }
        [Required]
        [MaxLength(255)]
        public string Message { get; set; }
        [Required]
        public bool IsRead { get; set; } = false;
        [Required]
        public DateTime Created { get; set; } = DateTime.Now;

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}
