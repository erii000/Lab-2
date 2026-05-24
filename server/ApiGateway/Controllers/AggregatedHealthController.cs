using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TravelAssistant.ApiGateway.Controllers;

/// <summary>
/// Probes each YARP cluster base URL (same config as reverse proxy) for liveness.
/// </summary>
[ApiController]
[Route("api/health")]
[AllowAnonymous]
public sealed class AggregatedHealthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;

    public AggregatedHealthController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Checks gateway plus each configured upstream cluster (/health, falling back to /api/ping).
    /// </summary>
    [HttpGet("upstreams")]
    [ProducesResponseType(typeof(AggregatedHealthResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUpstreamHealth(CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient("UpstreamProbe");
        var clustersSection = _configuration.GetSection("ReverseProxy:Clusters");
        var items = new List<UpstreamClusterHealthDto>();

        foreach (var cluster in clustersSection.GetChildren())
        {
            var clusterId = cluster.Key;
            var dest = cluster.GetSection("Destinations").GetChildren().FirstOrDefault();
            var address = dest?["Address"]?.Trim().TrimEnd('/');
            if (string.IsNullOrEmpty(address))
                continue;

            var dto = await ProbeClusterAsync(client, clusterId, address, cancellationToken);
            items.Add(dto);
        }

        var allOk = items.Count > 0 && items.All(x => x.Healthy);
        var response = new AggregatedHealthResponse
        {
            Gateway = "Healthy",
            Overall = allOk ? "Healthy" : "Degraded",
            CheckedAtUtc = DateTime.UtcNow,
            Clusters = items
        };

        return Ok(response);
    }

    private static async Task<UpstreamClusterHealthDto> ProbeClusterAsync(
        HttpClient client,
        string clusterId,
        string baseUrl,
        CancellationToken cancellationToken)
    {
        UpstreamClusterHealthDto? last = null;

        foreach (var path in new[] { "/health", "/api/ping" })
        {
            try
            {
                using var response = await client.GetAsync($"{baseUrl}{path}", cancellationToken);
                var ok = response.StatusCode == HttpStatusCode.OK;
                last = new UpstreamClusterHealthDto
                {
                    ClusterId = clusterId,
                    BaseUrl = baseUrl,
                    PathUsed = path,
                    StatusCode = (int)response.StatusCode,
                    Healthy = ok
                };
                if (ok)
                    return last;
            }
            catch (Exception ex)
            {
                last = new UpstreamClusterHealthDto
                {
                    ClusterId = clusterId,
                    BaseUrl = baseUrl,
                    PathUsed = path,
                    Healthy = false,
                    Error = ex.Message
                };
            }
        }

        return last ?? new UpstreamClusterHealthDto
        {
            ClusterId = clusterId,
            BaseUrl = baseUrl,
            PathUsed = "(unreachable)",
            Healthy = false
        };
    }
}

public sealed class AggregatedHealthResponse
{
    public string Gateway { get; set; } = "";
    public string Overall { get; set; } = "";
    public DateTime CheckedAtUtc { get; set; }
    public IReadOnlyList<UpstreamClusterHealthDto> Clusters { get; set; } = Array.Empty<UpstreamClusterHealthDto>();
}

public sealed class UpstreamClusterHealthDto
{
    public string ClusterId { get; set; } = "";
    public string BaseUrl { get; set; } = "";
    public string PathUsed { get; set; } = "";
    public int StatusCode { get; set; }
    public bool Healthy { get; set; }
    public string? Error { get; set; }
}
