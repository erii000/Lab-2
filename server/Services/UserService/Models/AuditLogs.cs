using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class AuditLogs
    {
        [Key]
        public int AuditLogsId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Action {  get; set; }
        [Required]
        public string Entity {  get; set; }

        public int EntityId { get; set; }
        [MaxLength(255)]
        public string OldValue { get; set; }
        [MaxLength(255)]
        public string NewValue { get; set; }
        [MaxLength(50)]
        public string IpAdress  { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey(nameof(UserId))]
        public User? User {  get; set; }
    }
}
