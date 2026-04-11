namespace TravelAssistant.Services.PaymentService.Models.Entities;

public sealed class Expense
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public int UserId { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
