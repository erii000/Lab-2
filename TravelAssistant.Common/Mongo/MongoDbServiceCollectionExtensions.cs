using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace TravelAssistant.Common.Mongo;

public static class MongoDbServiceCollectionExtensions
{
    public static IServiceCollection AddTravelAssistantMongoDb(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MongoDbOptions>(configuration.GetSection(MongoDbOptions.SectionName));

        services.AddSingleton<IMongoClient>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<MongoDbOptions>>().Value;
            if (string.IsNullOrWhiteSpace(options.ConnectionString))
                throw new InvalidOperationException("MongoDb:ConnectionString is required.");

            return new MongoClient(options.ConnectionString);
        });

        services.AddSingleton(sp =>
        {
            var options = sp.GetRequiredService<IOptions<MongoDbOptions>>().Value;
            var client = sp.GetRequiredService<IMongoClient>();
            return client.GetDatabase(string.IsNullOrWhiteSpace(options.Database)
                ? "travel_assistant"
                : options.Database);
        });

        return services;
    }

    public static IMongoCollection<TDocument> GetMongoCollection<TDocument>(
        this IServiceProvider services,
        string collectionName) =>
        services.GetRequiredService<IMongoDatabase>().GetCollection<TDocument>(collectionName);
}
