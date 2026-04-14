using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.AuditService.Data;
using TravelAssistant.Services.AuditService.Interfaces;
using TravelAssistant.Services.AuditService.Models;

namespace TravelAssistant.Services.AuditService.Services
{
    public sealed class AuditLogService : IAuditLogService
    {
        private readonly ApplicationDbContext _context;

        public AuditLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AuditLog>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.AuditLogs
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<AuditLog> CreateAsync(AuditLog auditLog, CancellationToken cancellationToken = default)
        {
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync(cancellationToken);
            return auditLog;
        }
    }
}