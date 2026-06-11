using MongoDB.Driver;
using TravelAssistant.Services.PaymentService.Models.Entities;

namespace TravelAssistant.Services.PaymentService.Repositories;

public sealed class MongoPaymentTransactionLogStore : IPaymentTransactionLogStore
{
    public const string CollectionName = "payment_transaction_logs";
    public const string CountersCollectionName = "counters";

    private readonly IMongoCollection<PaymentTransactionLogDocument> _collection;
    private readonly IMongoCollection<CounterDocument> _counters;

    public MongoPaymentTransactionLogStore(IMongoDatabase database)
    {
        _collection = database.GetCollection<PaymentTransactionLogDocument>(CollectionName);
        _counters = database.GetCollection<CounterDocument>(CountersCollectionName);
    }

    public async Task AddAsync(PaymentTransactionLog log, CancellationToken cancellationToken = default)
    {
        if (log.CreatedAt == default)
            log.CreatedAt = DateTime.UtcNow;

        log.Id = await NextSequenceAsync("payment_transaction_logs", cancellationToken);
        var document = PaymentTransactionLogDocument.FromEntity(log);
        await _collection.InsertOneAsync(document, cancellationToken: cancellationToken);
    }

    public async Task<bool> ExistsForEventAsync(string externalEventId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(externalEventId))
            return false;

        var filter = Builders<PaymentTransactionLogDocument>.Filter.Eq(x => x.ExternalEventId, externalEventId.Trim());
        return await _collection.Find(filter).AnyAsync(cancellationToken);
    }

    private async Task<long> NextSequenceAsync(string name, CancellationToken cancellationToken)
    {
        var filter = Builders<CounterDocument>.Filter.Eq(x => x.Id, name);
        var update = Builders<CounterDocument>.Update.Inc(x => x.Sequence, 1);
        var options = new FindOneAndUpdateOptions<CounterDocument>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After
        };

        var counter = await _counters.FindOneAndUpdateAsync(filter, update, options, cancellationToken);
        return counter.Sequence;
    }

    private sealed class CounterDocument
    {
        public string Id { get; set; } = string.Empty;
        public long Sequence { get; set; }
    }
}
