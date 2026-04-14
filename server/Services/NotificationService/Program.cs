using Microsoft.OpenApi.Models;
using TravelAssistant.Services.NotificationService.Services;
using TravelAssistant.Services.NotificationService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.NotificationService.Data;
using TravelAssistant.Services.NotificationService.Interfaces;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<INotificationService, TravelAssistant.Services.NotificationService.Services.NotificationService>();


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
