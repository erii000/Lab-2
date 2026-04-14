namespace TravelAssistant.Services.PaymentService.DTOs.Payments;

public sealed class PaymentDetailResponse
{
    public int Id { get; init; }
    public int UserId { get; init; }
    public int BookingId { get; init; }
    public decimal Amount { get; init; }
    public string? Currency { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;
    public string PaymentStatus { get; init; } = string.Empty;
    public string? ExternalReference { get; init; }
    public DateTime? PaidAt { get; init; }
    public DateTime CreatedAt { get; init; }
}
