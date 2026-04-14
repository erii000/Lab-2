using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class TripParticipants
    {
        [Key]
        public int TripParticipantId { get; set; }
        [Required]
        public int TripId { get; set; }
        [Required]
        public int UserId { get; set; }
        [MaxLength(50)]
        public string Role { get; set; } =string.Empty;
        [Required]
        public DateTime JoinedAt { get; set; } = DateTime.Now;
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        [ForeignKey(nameof(TripId))]
        public Trips? Trips { get; set; }

    }
}
