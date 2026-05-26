namespace TravelAssistant.Common.Audit;

public interface IAuditWriter
{
    Task WriteAsync(
        int? userId,
        string action,
        string entityName,
        string? details = null,
        CancellationToken cancellationToken = default);
}
