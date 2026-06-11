using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace TravelAssistant.Common.Caching;

public static class RedisServiceCollectionExtensions
{
    public static IServiceCollection AddTravelAssistantRedisCache(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RedisOptions>(configuration.GetSection(RedisOptions.SectionName));

        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<RedisOptions>>().Value;
            if (string.IsNullOrWhiteSpace(options.ConnectionString))
                throw new InvalidOperationException("Redis:ConnectionString is required.");

            return ConnectionMultiplexer.Connect(options.ConnectionString);
        });

        services.AddSingleton<IResponseCache, RedisResponseCache>();
        return services;
    }
}
