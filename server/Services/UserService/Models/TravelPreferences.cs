using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class TravelPreferences
    {
        [Key]
        public int TravelPreferenceId { get; set; }
        [Required]
        public int UserId { get; set; }
        [MaxLength(50)]
        public string PreferredTransport { get; set; }
        [MaxLength(50)]
        public string PreferredAccomodation { get; set; }
        public decimal BudgetMax {  get; set; }
        public decimal BudgetMin { get; set; }
        [MaxLength(100)]
        public string FavoriteDestinationType { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

    }
}
