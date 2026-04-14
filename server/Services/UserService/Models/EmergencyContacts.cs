using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class EmergencyContacts
    {
        [Key]
        public int EmergencyContactId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [MaxLength(50)]
        public string Relationship { get; set; }
        [MaxLength(30)]
        [Required]
        public string PhoneNumber { get; set; }
        [MaxLength(100)]
        public string Email { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt {  get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}
