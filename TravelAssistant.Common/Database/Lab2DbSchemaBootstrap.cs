using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace TravelAssistant.Common.Database;

/// <summary>
/// Ensures Member B tables exist before EF incremental migrations (InitialMemberB is a no-op marker).
/// </summary>
public static class Lab2DbSchemaBootstrap
{
    public static async Task EnsureMemberBSchemaAsync(
        DbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var sql = await LoadBootstrapSqlAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(sql))
        {
            logger.LogWarning("lab2DB-memberb-bootstrap.sql not found — skipping schema bootstrap.");
            return;
        }

        try
        {
            // ExecuteSqlRaw treats { } as format placeholders; escape literals (e.g. DEFAULT (N'{}')).
            var escaped = sql.Replace("{", "{{").Replace("}", "}}");
            await dbContext.Database.ExecuteSqlRawAsync(escaped, cancellationToken);
            logger.LogInformation("Member B schema bootstrap completed.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Member B schema bootstrap failed — migrations may still apply partial schema.");
        }
    }

    private static async Task<string?> LoadBootstrapSqlAsync(CancellationToken cancellationToken)
    {
        var candidates = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "Scripts", "lab2DB-memberb-bootstrap.sql"),
            Path.Combine(Directory.GetCurrentDirectory(), "Scripts", "lab2DB-memberb-bootstrap.sql"),
            Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "Scripts", "lab2DB-memberb-bootstrap.sql")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "Scripts", "lab2DB-memberb-bootstrap.sql")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "Scripts", "lab2DB-memberb-bootstrap.sql")),
        };

        foreach (var path in candidates.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            if (!File.Exists(path))
                continue;

            return await File.ReadAllTextAsync(path, cancellationToken);
        }

        return null;
    }
}
