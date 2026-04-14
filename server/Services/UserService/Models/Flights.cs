using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class Flights
    {
        [Key]
        public int FlightId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        [MaxLength(100)]
        public string FromCity { get; set; }
        [Required]
        [MaxLength(100)]
        public string ToCity { get; set; }
        [Required]
        public DateTime DepartureDate { get; set; }
        [Required]
        public DateTime ArrivalDate { get; set; }
        [MaxLength(100)]
        public string Airline { get; set; }
        public decimal Price { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public User? User {  get; set; }

    }
}
