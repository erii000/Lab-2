using System.ComponentModel.DataAnnotations.Schema;

namespace TravelAssistant.Services.UserService.Models.Entities
{
    public class RefreshToken : BaseEntity
    {
        public string TokenHash { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }

        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}