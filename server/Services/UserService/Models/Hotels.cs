using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models
{
    public class Hotels
    {
        [Key]
        public int HotelId { get; set; }
        [Required]
        public int DestinationId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [MaxLength(255)]
        public string Adress { get; set; }
        public decimal Rating { get; set; }
        public decimal PricePerNight { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; }
        [Required]
        public DateTime UpdatedAt { get; set; }

        [ForeignKey(nameof(DestinationId))]
        public Destinations? Destinations { get; set; }

    }
}
