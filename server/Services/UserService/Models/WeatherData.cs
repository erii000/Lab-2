using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models
{
    public class WeatherData
    {
        [Key]
        public int WeatherDataId  { get; set; }
        [Required]
        public int DestinationId { get; set; }
        [Required]
        public DateTime WeatherDate { get; set; }
        public decimal Temperature {  get; set; }
        [MaxLength(100)]
        public string WeatherCondition { get; set; }
        public int Humidity { get; set; }
        public decimal WindSpeed { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey(nameof(DestinationId))]
        public Destinations? Destinations { get; set; }

    }
}
