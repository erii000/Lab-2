using MongoDB.Driver;
using TravelAssistant.Services.AuditService.Models;
using TravelAssistant.Services.AuditService.Repositories;

namespace TravelAssistant.Services.AuditService.Infrastructure;

public static class MongoIndexInitializer
{
    public static async Task EnsureIndexesAsync(IMongoDatabase database, CancellationToken cancellationToken = default)
    {
        var collection = database.GetCollection<AuditLogDocument>(MongoAuditLogRepository.CollectionName);
        var models = new[]
        {
            new CreateIndexModel<AuditLogDocument>(
                Builders<AuditLogDocument>.IndexKeys
                    .Ascending(x => x.UserId)
                    .Descending(x => x.CreatedAt)),
            new CreateIndexModel<AuditLogDocument>(
                Builders<AuditLogDocument>.IndexKeys
                    .Ascending(x => x.EntityName)
                    .Descending(x => x.CreatedAt)),
            new CreateIndexModel<AuditLogDocument>(
                Builders<AuditLogDocument>.IndexKeys.Descending(x => x.CreatedAt)),
            new CreateIndexModel<AuditLogDocument>(
                Builders<AuditLogDocument>.IndexKeys.Ascending(x => x.Id),
                new CreateIndexOptions { Unique = true })
        };

        await collection.Indexes.CreateManyAsync(models, cancellationToken);
    }
}
