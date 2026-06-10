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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SupportTicket>(entity =>
            {
                entity.ToTable("SupportTickets");
                entity.HasKey(x => x.Id);
                entity.Property(x => x.Subject).HasMaxLength(200).IsRequired();
                entity.Property(x => x.Description).HasColumnType("nvarchar(max)").IsRequired();
                entity.Property(x => x.Status).HasMaxLength(50).IsRequired();
                entity.Property(x => x.CreatedAt).HasColumnType("datetime2").IsRequired();
            });
        }
    }
}