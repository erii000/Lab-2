using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace TravelAssistant.Common.Audit;

public sealed class HttpAuditWriter : IAuditWriter
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<HttpAuditWriter> _logger;
    private readonly string? _internalKey;

    public HttpAuditWriter(HttpClient httpClient, IOptions<AuditWriterOptions> options, ILogger<HttpAuditWriter> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _internalKey = options.Value.InternalKey;
        var baseUrl = options.Value.BaseUrl?.Trim();
        if (!string.IsNullOrWhiteSpace(baseUrl))
        {
            _httpClient.BaseAddress = new Uri(baseUrl.EndsWith('/') ? baseUrl : baseUrl + "/");
        }
    }

    public async Task WriteAsync(
        int? userId,
        string action,
        string entityName,
        string? details = null,
        CancellationToken cancellationToken = default)
    {
        if (_httpClient.BaseAddress is null)
            return;

        try
        {
            var payload = new
            {
                UserId = userId,
                Action = action,
                EntityName = entityName,
                Details = details ?? string.Empty
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, "api/v1/auditlogs")
            {
                Content = JsonContent.Create(payload)
            };
            if (!string.IsNullOrWhiteSpace(_internalKey))
                request.Headers.TryAddWithoutValidation("X-Audit-Key", _internalKey);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Audit write failed with status {Status}", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Audit write skipped");
        }
    }
}
