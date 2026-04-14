using TravelAssistant.Services.PaymentService.DTOs.Payments;

namespace TravelAssistant.Services.PaymentService.Services.Payments;

public interface IPaymentCheckoutService
{
    Task<CreateCheckoutSessionResponse> CreateCheckoutAsync(int userId, CreateCheckoutSessionRequest request, CancellationToken cancellationToken = default);
}
