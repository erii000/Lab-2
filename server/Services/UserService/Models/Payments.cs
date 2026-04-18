using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class Payments
    {
        [Key]
        public int PaymentId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        public int BookingId { get; set; }
        [Required]
        public decimal Amount { get; set; }
        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; }
        [Required]
        [MaxLength(50)]
        public string PaymentStatus { get; set; }
        public DateTime PaidAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        [ForeignKey(nameof(BookingId))]
        public Bookings? Bookings { get; set; }
    }
}
