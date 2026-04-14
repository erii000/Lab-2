using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class Trips
    {
        [Key]
        public int TripId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Title { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        public decimal Budget {  get; set; }
        [Required]
        [MaxLength(100)]
        public string Status { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; }= DateTime.Now;
        public DateTime UpdatedAt { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}
