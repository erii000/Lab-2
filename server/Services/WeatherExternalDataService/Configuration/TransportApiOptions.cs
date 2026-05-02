namespace TravelAssistant.Services.WeatherExternalDataService.Configuration;

public sealed class TransportApiOptions
{
    public const string SectionName = "ExternalApis:Transport";

    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
}
