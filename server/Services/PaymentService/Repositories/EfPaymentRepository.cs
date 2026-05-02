using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.PaymentService.Data;
using TravelAssistant.Services.PaymentService.Models.Entities;

namespace TravelAssistant.Services.PaymentService.Repositories;

public sealed class EfPaymentRepository : IPaymentRepository
{
    private readonly ApplicationDbContext _dbContext;

    public EfPaymentRepository(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public Task<Payment?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _dbContext.Payments.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<Payment?> GetTrackedByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _dbContext.Payments.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<Payment?> GetTrackedByExternalReferenceAsync(string externalReference, CancellationToken cancellationToken = default) =>
        _dbContext.Payments.FirstOrDefaultAsync(x => x.ExternalReference == externalReference, cancellationToken);

    public async Task<IReadOnlyList<Payment>> ListByUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Payments
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task AddAsync(Payment payment, CancellationToken cancellationToken = default)
    {
        _dbContext.Payments.Add(payment);
        return Task.CompletedTask;
    }

    public Task AddLogAsync(PaymentTransactionLog log, CancellationToken cancellationToken = default)
    {
        _dbContext.PaymentTransactionLogs.Add(log);
        return Task.CompletedTask;
    }

    public Task<bool> LogExistsForEventAsync(string externalEventId, CancellationToken cancellationToken = default) =>
        _dbContext.PaymentTransactionLogs.AnyAsync(x => x.ExternalEventId == externalEventId, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
