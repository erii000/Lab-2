using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class Expenses
    {
        [Key]
        public int ExpensesId { get; set; }
        [Required]
        public int TripId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Category { get; set; }
        [Required]
        public decimal Amount { get; set; }
        public string Description { get; set; }
        [Required]
        public DateTime ExpenseDate { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        [ForeignKey(nameof(TripId))]
        public Trips? Trips { get; set; }

    }
}
