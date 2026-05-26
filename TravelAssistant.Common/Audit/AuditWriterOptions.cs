namespace TravelAssistant.Common.Audit;

public sealed class AuditWriterOptions
{
    public const string SectionName = "AuditService";

    /// <summary>Base URL of AuditService, e.g. http://localhost:65486/</summary>
    public string BaseUrl { get; set; } = "http://localhost:65486/";

    /// <summary>Shared key for service-to-service audit writes (header X-Audit-Key).</summary>
    public string InternalKey { get; set; } = "dev-audit-internal-key";
}
