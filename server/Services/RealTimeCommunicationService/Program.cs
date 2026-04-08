using Microsoft.OpenApi.Models;
using TravelAssistant.Services.RealTimeCommunicationService.Hubs;
using TravelAssistant.Services.RealTimeCommunicationService.Services;
using TravelAssistant.Services.RealTimeCommunicationService.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Realtime Communication Service API", Version = "v1" });
});

builder.Services.AddScoped<IRealtimeNotificationService, RealtimeNotificationService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();
app.MapHub<NotificationsHub>("/hubs/notifications");
app.MapGet("/api/ping", () => Results.Ok(new { status = "ok", service = "RealTimeCommunicationService" }));

app.Run();
