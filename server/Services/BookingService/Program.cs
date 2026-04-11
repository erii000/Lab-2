using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using TravelAssistant.Services.BookingService.Data;

var rootEnvPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "global-settings.env"));
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
// Later files win; avoids global-settings overwriting service .env when DotNetEnv does not clobber.
var envFiles = new[] { rootEnvPath, envPath }.Where(File.Exists).ToArray();
if (envFiles.Length > 0)
{
    Env.LoadMulti(envFiles);
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Booking Service API", Version = "v1" });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("ConnectionStrings:DefaultConnection is missing for BookingService.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddHealthChecks();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.MapControllers();
app.MapHealthChecks("/health");
app.MapGet("/api/ping", () => Results.Ok(new { status = "ok", service = "BookingService" }));

app.Run();
