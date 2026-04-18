using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using TravelAssistant.Services.SupportService.Models;

namespace TravelAssistant.Services.SupportService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<SupportTicket> SupportTickets { get; set; }
    }
}