using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TravelAssistant.Common.Notifications;

public static class NotificationPublisherServiceCollectionExtensions
{
    public static IServiceCollection AddTravelUpdatePublisher(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<TravelUpdatePublisherOptions>(options =>
        {
            configuration.GetSection(TravelUpdatePublisherOptions.SectionName).Bind(options);
            if (string.IsNullOrWhiteSpace(options.InternalKey))
                options.InternalKey = configuration["Notification:InternalKey"] ?? "dev-notification-internal-key";
        });
        services.AddHttpClient<ITravelUpdatePublisher, HttpTravelUpdatePublisher>();
        return services;
    }
}
