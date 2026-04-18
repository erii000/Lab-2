using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models
{
    public class TransportOptions
    {
        [Key]
        public int TransportOptionId { get; set; }
        [Required]
        public int DestinationId { get; set; }
        [Required]
        [MaxLength(50)]
        public string Type { get; set; }
        [MaxLength(100)]
        public string Provider { get; set; }
        public decimal Price { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; }

        [ForeignKey(nameof(DestinationId))]
        public Destinations? Destinations { get; set; }
    }
}
