using Microsoft.OpenApi.Models;
using TravelAssistant.Services.NotificationService.Services;
using TravelAssistant.Services.NotificationService.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Notification Service API", Version = "v1" });
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
app.MapGet("/api/ping", () => Results.Ok(new { status = "ok", service = "NotificationService" }));

app.Run();
