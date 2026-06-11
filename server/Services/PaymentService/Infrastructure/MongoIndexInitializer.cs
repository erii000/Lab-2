using MongoDB.Driver;
using TravelAssistant.Services.PaymentService.Models.Entities;
using TravelAssistant.Services.PaymentService.Repositories;

namespace TravelAssistant.Services.PaymentService.Infrastructure;

public static class MongoIndexInitializer
{
    public static async Task EnsureIndexesAsync(IMongoDatabase database, CancellationToken cancellationToken = default)
    {
        var collection = database.GetCollection<PaymentTransactionLogDocument>(MongoPaymentTransactionLogStore.CollectionName);
        var models = new[]
        {
            new CreateIndexModel<PaymentTransactionLogDocument>(
                Builders<PaymentTransactionLogDocument>.IndexKeys
                    .Ascending(x => x.ExternalEventId),
                new CreateIndexOptions { Unique = true }),
            new CreateIndexModel<PaymentTransactionLogDocument>(
                Builders<PaymentTransactionLogDocument>.IndexKeys
                    .Ascending(x => x.PaymentId)
                    .Descending(x => x.CreatedAt)),
            new CreateIndexModel<PaymentTransactionLogDocument>(
                Builders<PaymentTransactionLogDocument>.IndexKeys.Descending(x => x.CreatedAt))
        };

        await collection.Indexes.CreateManyAsync(models, cancellationToken);
    }
}
