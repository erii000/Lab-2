using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TravelAssistant.Services.RealTimeCommunicationService.Data;
using TravelAssistant.Services.RealTimeCommunicationService.Hubs;
using TravelAssistant.Services.RealTimeCommunicationService.Interfaces;
using TravelAssistant.Services.RealTimeCommunicationService.Repositories;
using TravelAssistant.Services.RealTimeCommunicationService.Services;
using TravelAssistant.Common.Middleware;
using TravelAssistant.Common.SignalR;

var rootEnvPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "global-settings.env"));
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
var envFiles = new[] { rootEnvPath, envPath }.Where(File.Exists).ToArray();
if (envFiles.Length > 0)
{
    Env.LoadMulti(envFiles);
}

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("ConnectionStrings:DefaultConnection is missing for RealTimeCommunicationService.");
}

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"];

if (string.IsNullOrWhiteSpace(jwtIssuer) ||
    string.IsNullOrWhiteSpace(jwtAudience) ||
    string.IsNullOrWhiteSpace(jwtSecretKey))
{
    throw new InvalidOperationException("Jwt configuration is missing for RealTimeCommunicationService.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddScoped<IChatService, ChatService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrWhiteSpace(accessToken) &&
                    (path.StartsWithSegments("/hubs/notifications") || path.StartsWithSegments("/hubs/chat")))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSignalR();
builder.Services.AddSingleton<Microsoft.AspNetCore.SignalR.IUserIdProvider, JwtUserIdProvider>();
builder.Services.AddScoped<IChatRepository, EfChatRepository>();
builder.Services.AddHealthChecks();

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

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");
app.MapHub<NotificationsHub>("/hubs/notifications");
app.MapHub<ChatHub>("/hubs/chat");
app.MapGet("/api/ping", () => Results.Ok(new { status = "ok", service = "RealTimeCommunicationService" }));

app.Run();
