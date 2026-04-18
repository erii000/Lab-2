using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class Wishlists
    {
        [Key]
        public int WishlistId { get; set; }
        [Required]
        public int UserId { get; set; }
        public int DestinationId { get; set; }
        public int HotelId { get; set; }
        public int FlightId { get; set; }
        [Required]
        public DateTime AddedAt { get; set; } = DateTime.Now;

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        [ForeignKey(nameof(DestinationId))]
        public Destinations? Destinations { get; set; }

        [ForeignKey(nameof(HotelId))]
        public Hotels? Hotels { get; set; }

        [ForeignKey(nameof(FlightId))]
        public Flights? Flights { get; set; }

        
    }
}
