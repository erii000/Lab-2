using MongoDB.Driver;
using TravelAssistant.Services.AuditService.Contracts.AuditLogs;
using TravelAssistant.Services.AuditService.Models;

namespace TravelAssistant.Services.AuditService.Repositories;

public sealed class MongoAuditLogRepository : IAuditLogRepository
{
    public const string CollectionName = "audit_logs";
    public const string CountersCollectionName = "counters";

    private readonly IMongoCollection<AuditLogDocument> _collection;
    private readonly IMongoCollection<CounterDocument> _counters;

    public MongoAuditLogRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<AuditLogDocument>(CollectionName);
        _counters = database.GetCollection<CounterDocument>(CountersCollectionName);
    }

    public async Task<IReadOnlyList<AuditLog>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var docs = await _collection
            .Find(FilterDefinition<AuditLogDocument>.Empty)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return docs.Select(x => x.ToModel()).ToList();
    }

    public async Task<(IReadOnlyList<AuditLog> Items, int Total)> SearchAsync(
        AuditLogSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize switch
        {
            < 1 => 20,
            > 100 => 100,
            _ => request.PageSize
        };

        var filter = BuildFilter(request);
        var total = (int)await _collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

        var sort = BuildSort(request);
        var docs = await _collection
            .Find(filter)
            .Sort(sort)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);

        return (docs.Select(x => x.ToModel()).ToList(), total);
    }

    public async Task<AuditLog> AddAsync(AuditLog auditLog, CancellationToken cancellationToken = default)
    {
        if (auditLog.CreatedAt == default)
            auditLog.CreatedAt = DateTime.UtcNow;

        auditLog.Id = await NextSequenceAsync("audit_logs", cancellationToken);
        var document = AuditLogDocument.FromModel(auditLog);
        await _collection.InsertOneAsync(document, cancellationToken: cancellationToken);
        return document.ToModel();
    }

    private static FilterDefinition<AuditLogDocument> BuildFilter(AuditLogSearchRequest request)
    {
        var builder = Builders<AuditLogDocument>.Filter;
        var filters = new List<FilterDefinition<AuditLogDocument>>();

        if (!string.IsNullOrWhiteSpace(request.Q))
        {
            var search = request.Q.Trim();
            filters.Add(builder.Or(
                builder.Regex(x => x.Action, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                builder.Regex(x => x.EntityName, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                builder.Regex(x => x.Details, new MongoDB.Bson.BsonRegularExpression(search, "i"))));
        }

        if (request.UserId.HasValue)
            filters.Add(builder.Eq(x => x.UserId, request.UserId));

        if (!string.IsNullOrWhiteSpace(request.EntityName))
            filters.Add(builder.Eq(x => x.EntityName, request.EntityName.Trim()));

        if (!string.IsNullOrWhiteSpace(request.Action))
            filters.Add(builder.Eq(x => x.Action, request.Action.Trim()));

        if (request.CreatedFromUtc.HasValue)
            filters.Add(builder.Gte(x => x.CreatedAt, request.CreatedFromUtc));

        if (request.CreatedToUtc.HasValue)
            filters.Add(builder.Lte(x => x.CreatedAt, request.CreatedToUtc));

        return filters.Count == 0 ? builder.Empty : builder.And(filters);
    }

    private static SortDefinition<AuditLogDocument> BuildSort(AuditLogSearchRequest request)
    {
        var sortBy = request.SortBy?.Trim().ToLowerInvariant() ?? "createdat";
        var descending = !string.Equals(request.SortOrder, "asc", StringComparison.OrdinalIgnoreCase);

        return sortBy switch
        {
            "action" => descending
                ? Builders<AuditLogDocument>.Sort.Descending(x => x.Action)
                : Builders<AuditLogDocument>.Sort.Ascending(x => x.Action),
            "entityname" => descending
                ? Builders<AuditLogDocument>.Sort.Descending(x => x.EntityName)
                : Builders<AuditLogDocument>.Sort.Ascending(x => x.EntityName),
            "userid" => descending
                ? Builders<AuditLogDocument>.Sort.Descending(x => x.UserId)
                : Builders<AuditLogDocument>.Sort.Ascending(x => x.UserId),
            _ => descending
                ? Builders<AuditLogDocument>.Sort.Descending(x => x.CreatedAt)
                : Builders<AuditLogDocument>.Sort.Ascending(x => x.CreatedAt)
        };
    }

    private async Task<int> NextSequenceAsync(string name, CancellationToken cancellationToken)
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
        public int Sequence { get; set; }
    }
}
