using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class Reviews
    {
        [Key]
        public int ReviewId { get; set; }
        [Required]
        public int UserId { get; set; }
        public int DestinationId { get; set; }
        public int HotelId { get; set; }
        [Required]
        public int Rating {  get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        [ForeignKey(nameof(DestinationId))]
        public Destinations? Destinations { get; set; }
        [ForeignKey(nameof(HotelId))]
        public Hotels? Hotels { get; set; }
    }
}
