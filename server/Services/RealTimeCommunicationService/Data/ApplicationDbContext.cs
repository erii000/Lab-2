using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using TravelAssistant.Services.RealTimeCommunicationService.Models;

namespace TravelAssistant.Services.RealTimeCommunicationService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<ChatMessage> ChatMessages { get; set; }
    }
}