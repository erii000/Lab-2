namespace TravelAssistant.Services.WeatherExternalDataService.Configuration;

public sealed class AviationStackOptions
{
    public const string SectionName = "ExternalApis:AviationStack";

    public string BaseUrl { get; set; } = "https://api.aviationstack.com/v1/";
    public string? AccessKey { get; set; }
}
