namespace TravelAssistant.Services.WeatherExternalDataService.Models
{
    public class WeatherData
    {
        public int Id { get; set; }
        public string City { get; set; } = string.Empty;
        public decimal Temperature { get; set; }
        public string Condition { get; set; } = string.Empty;
        public DateTime ForecastDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}