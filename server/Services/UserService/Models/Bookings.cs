using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class Bookings
    {
        [Key]
        public int BookingsId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        public string ItinerariesId { get; set; }
        [Required]
        [MaxLength(50)]
        public string BookingType { get; set; }
        [Required]
        public DateTime BookingDate { get; set; }
        [Required]
        [MaxLength(50)]
        public string Status { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        [ForeignKey(nameof(ItinerariesId))]
        public Itineraries? Itineraries { get; set; }
    }
}
