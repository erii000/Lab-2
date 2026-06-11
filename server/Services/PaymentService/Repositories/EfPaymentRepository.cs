using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.PaymentService.Data;
using TravelAssistant.Services.PaymentService.DTOs.Payments;
using TravelAssistant.Services.PaymentService.Models.Entities;

namespace TravelAssistant.Services.PaymentService.Repositories;

public sealed class EfPaymentRepository : IPaymentRepository
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IPaymentTransactionLogStore _transactionLogStore;

    public EfPaymentRepository(ApplicationDbContext dbContext, IPaymentTransactionLogStore transactionLogStore)
    {
        _dbContext = dbContext;
        _transactionLogStore = transactionLogStore;
    }

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

    public Task AddLogAsync(PaymentTransactionLog log, CancellationToken cancellationToken = default) =>
        _transactionLogStore.AddAsync(log, cancellationToken);

    public Task<bool> LogExistsForEventAsync(string externalEventId, CancellationToken cancellationToken = default) =>
        _transactionLogStore.ExistsForEventAsync(externalEventId, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);

    public async Task<(IReadOnlyList<Payment> Items, int Total)> SearchAsync(
        PaymentSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery(request);
        var total = await query.CountAsync(cancellationToken);
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var sorted = ApplySort(query, request.SortBy, request.SortOrder);
        var items = await sorted
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<IReadOnlyList<Payment>> ListForExportAsync(
        PaymentSearchRequest request,
        int maxRows,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery(request);
        var sorted = ApplySort(query, request.SortBy, request.SortOrder);
        var list = await sorted.AsNoTracking().Take(Math.Clamp(maxRows, 1, 10_000)).ToListAsync(cancellationToken);
        return list;
    }

    private IQueryable<Payment> BuildQuery(PaymentSearchRequest request)
    {
        var query = _dbContext.Payments.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Q))
        {
            var q = request.Q.Trim();
            query = query.Where(x =>
                (x.ExternalReference != null && x.ExternalReference.Contains(q)) ||
                x.PaymentMethod.Contains(q) ||
                x.PaymentStatus.Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(request.PaymentStatus))
            query = query.Where(x => x.PaymentStatus == request.PaymentStatus.Trim());

        if (!string.IsNullOrWhiteSpace(request.PaymentMethod))
        {
            var m = request.PaymentMethod.Trim();
            query = query.Where(x => x.PaymentMethod.Contains(m));
        }

        if (request.CreatedFrom.HasValue)
            query = query.Where(x => x.CreatedAt >= request.CreatedFrom.Value);

        if (request.CreatedTo.HasValue)
            query = query.Where(x => x.CreatedAt <= request.CreatedTo.Value);

        if (request.MinAmount.HasValue)
            query = query.Where(x => x.Amount >= request.MinAmount.Value);

        if (request.MaxAmount.HasValue)
            query = query.Where(x => x.Amount <= request.MaxAmount.Value);

        return query;
    }

    private static IQueryable<Payment> ApplySort(IQueryable<Payment> query, string? sortBy, string? sortOrder)
    {
        var descending = !string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase);
        return (sortBy?.Trim().ToLowerInvariant()) switch
        {
            "amount" => descending
                ? query.OrderByDescending(x => x.Amount).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.Amount).ThenBy(x => x.Id),
            "status" => descending
                ? query.OrderByDescending(x => x.PaymentStatus).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.PaymentStatus).ThenBy(x => x.Id),
            "method" => descending
                ? query.OrderByDescending(x => x.PaymentMethod).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.PaymentMethod).ThenBy(x => x.Id),
            _ => descending
                ? query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id)
        };
    }
}
