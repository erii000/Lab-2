using TravelAssistant.Services.PaymentService.Models.Entities;

namespace TravelAssistant.Services.PaymentService.Repositories;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Payment?> GetTrackedByExternalReferenceAsync(string externalReference, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Payment>> ListByUserAsync(int userId, CancellationToken cancellationToken = default);
    Task AddAsync(Payment payment, CancellationToken cancellationToken = default);
    Task AddLogAsync(PaymentTransactionLog log, CancellationToken cancellationToken = default);
    Task<bool> LogExistsForEventAsync(string externalEventId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<Payment?> GetTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
}
