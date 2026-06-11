using System.Text.Json;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace TravelAssistant.Common.Caching;

public sealed class RedisResponseCache : IResponseCache
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    private readonly IConnectionMultiplexer _multiplexer;
    private readonly ILogger<RedisResponseCache> _logger;

    public RedisResponseCache(IConnectionMultiplexer multiplexer, ILogger<RedisResponseCache> logger)
    {
        _multiplexer = multiplexer;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class
    {
        var db = _multiplexer.GetDatabase();
        var payload = await db.StringGetAsync(key).ConfigureAwait(false);
        if (payload.IsNullOrEmpty)
            return null;

        try
        {
            return JsonSerializer.Deserialize<T>(payload!, JsonOptions);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Redis cache entry for {CacheKey} could not be deserialized.", key);
            await db.KeyDeleteAsync(key).ConfigureAwait(false);
            return null;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken cancellationToken = default) where T : class
    {
        var db = _multiplexer.GetDatabase();
        var payload = JsonSerializer.Serialize(value, JsonOptions);
        await db.StringSetAsync(key, payload, ttl).ConfigureAwait(false);
    }

    public async Task<T> GetOrCreateAsync<T>(
        string key,
        Func<CancellationToken, Task<T>> factory,
        TimeSpan ttl,
        CancellationToken cancellationToken = default) where T : class
    {
        var cached = await GetAsync<T>(key, cancellationToken).ConfigureAwait(false);
        if (cached is not null)
            return cached;

        var created = await factory(cancellationToken).ConfigureAwait(false);
        await SetAsync(key, created, ttl, cancellationToken).ConfigureAwait(false);
        return created;
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        var db = _multiplexer.GetDatabase();
        return db.KeyDeleteAsync(key);
    }
}
