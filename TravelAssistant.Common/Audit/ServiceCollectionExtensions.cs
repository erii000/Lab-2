using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TravelAssistant.Common.Audit;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAuditWriter(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AuditWriterOptions>(options =>
        {
            configuration.GetSection(AuditWriterOptions.SectionName).Bind(options);
            if (string.IsNullOrWhiteSpace(options.InternalKey))
                options.InternalKey = configuration["Audit:InternalKey"] ?? "dev-audit-internal-key";
        });
        services.AddHttpClient<IAuditWriter, HttpAuditWriter>();
        return services;
    }
}
