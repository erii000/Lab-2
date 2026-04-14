using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class SavedTrips
    {
        [Key]
        public int SavedTripsId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        public int TripId { get; set; }
        [Required]
        public DateTime SavedAt { get; set; } = DateTime.Now;
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        [ForeignKey(nameof(TripId))]
        public Trips? Trips { get; set; }
    }
}
