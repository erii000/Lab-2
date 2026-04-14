using TravelAssistant.Services.PaymentService.DTOs.Payments;
using TravelAssistant.Services.PaymentService.Models.Entities;

namespace TravelAssistant.Services.PaymentService.Services.Payments;

public static class PaymentQueryService
{
    public static PaymentDetailResponse ToDto(Payment p) =>
        new()
        {
            Id = p.Id,
            UserId = p.UserId,
            BookingId = p.BookingId,
            Amount = p.Amount,
            Currency = p.Currency,
            PaymentMethod = p.PaymentMethod,
            PaymentStatus = p.PaymentStatus,
            ExternalReference = p.ExternalReference,
            PaidAt = p.PaidAt,
            CreatedAt = p.CreatedAt
        };
}
