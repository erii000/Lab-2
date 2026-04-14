using TravelAssistant.Services.WeatherExternalDataService.DTOs.Flights;

namespace TravelAssistant.Services.WeatherExternalDataService.Services.Flights;

public interface IFlightStatusClient
{
    Task<FlightStatusDto> GetByFlightNumberAsync(string flightNumber, DateOnly? flightDate, CancellationToken cancellationToken = default);
}
