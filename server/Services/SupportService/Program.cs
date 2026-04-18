using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using TravelAssistant.Services.SupportService.Data;
using TravelAssistant.Services.SupportService.Interfaces;
using TravelAssistant.Services.SupportService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ISupportTicketService, SupportTicketService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Support Service API",
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
app.MapGet("/api/ping", () => Results.Ok(new { status = "ok", service = "SupportService" }));

app.Run();
