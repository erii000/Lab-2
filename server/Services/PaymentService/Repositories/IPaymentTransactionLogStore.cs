using TravelAssistant.Services.PaymentService.Models.Entities;

namespace TravelAssistant.Services.PaymentService.Repositories;

public interface IPaymentTransactionLogStore
{
    Task AddAsync(PaymentTransactionLog log, CancellationToken cancellationToken = default);
    Task<bool> ExistsForEventAsync(string externalEventId, CancellationToken cancellationToken = default);
}
