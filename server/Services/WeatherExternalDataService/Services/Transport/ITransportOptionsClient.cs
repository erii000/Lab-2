using TravelAssistant.Services.WeatherExternalDataService.DTOs.Transport;

namespace TravelAssistant.Services.WeatherExternalDataService.Services.Transport;

public interface ITransportOptionsClient
{
    Task<IReadOnlyList<TransportOptionDto>> GetOptionsAsync(
        double fromLatitude,
        double fromLongitude,
        double toLatitude,
        double toLongitude,
        CancellationToken cancellationToken = default);
}
