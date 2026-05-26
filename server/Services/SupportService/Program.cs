using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TravelAssistant.Services.SupportService.Configuration;
using TravelAssistant.Services.SupportService.Data;
using TravelAssistant.Services.SupportService.Interfaces;
using TravelAssistant.Services.SupportService.Repositories;
using TravelAssistant.Services.SupportService.Services;
using TravelAssistant.Common.Middleware;

var rootEnvPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "global-settings.env"));
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
var envFiles = new[] { rootEnvPath, envPath }.Where(File.Exists).ToArray();
if (envFiles.Length > 0)
{
    Env.LoadMulti(envFiles);
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ISupportTicketRepository, EfSupportTicketRepository>();
builder.Services.AddScoped<ISupportTicketService, SupportTicketService>();
builder.Services.AddHealthChecks();

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
if (!string.IsNullOrWhiteSpace(jwtOptions.SecretKey))
{
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
                ValidIssuer = jwtOptions.Issuer,
                ValidAudience = jwtOptions.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey))
            };
        });
    builder.Services.AddAuthorization();
}

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
app.MapGet("/api/ping", () => Results.Ok(new { status = "ok", service = "SupportService" }));

app.Run();
