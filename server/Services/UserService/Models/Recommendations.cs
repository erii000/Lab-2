using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class Recommendations
    {
        [Key]
        public int RecommendationsId { get; set; }
        [Required]
        public int UserId { get; set; }
        public int DestinationId { get; set; }
        [Required]
        [MaxLength(100)]
        public string RecommendationText {  get; set; }
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        [ForeignKey(nameof(DestinationId))]
        public Destinations? Destinations { get; set; }
    }
}
