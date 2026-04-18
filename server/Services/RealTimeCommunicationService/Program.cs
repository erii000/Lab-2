using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using TravelAssistant.Services.RealTimeCommunicationService.Data;
using TravelAssistant.Services.RealTimeCommunicationService.Hubs;
using TravelAssistant.Services.RealTimeCommunicationService.Interfaces;
using TravelAssistant.Services.RealTimeCommunicationService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IChatService, ChatService>();

builder.Services.AddSignalR();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Real Time Communication Service API",
        Version = "v1"
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationsHub>("/hubs/notifications");
app.MapGet("/api/ping", () => Results.Ok(new { status = "ok", service = "RealTimeCommunicationService" }));

app.Run();