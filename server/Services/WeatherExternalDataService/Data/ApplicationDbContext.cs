using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using TravelAssistant.Services.WeatherExternalDataService.Models;

namespace TravelAssistant.Services.WeatherExternalDataService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<WeatherData> WeatherData { get; set; }
    }
}