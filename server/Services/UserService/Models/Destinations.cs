using System.ComponentModel.DataAnnotations;

namespace UserService.Models
{
    public class Destinations
    {
        [Key]
        public int DestinationId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [Required]
        [MaxLength(100)]
        public string Country { get; set; }
        [Required]
        [MaxLength(100)]
        public string City { get; set; }
        [MaxLength(500)]
        public string Description { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedBy {  get; set; }
    }
}
