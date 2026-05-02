using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;
using TravelAssistant.Services.WeatherExternalDataService.Configuration;
using TravelAssistant.Services.WeatherExternalDataService.Services.Flights;
using TravelAssistant.Services.WeatherExternalDataService.Services.Transport;
using TravelAssistant.Services.WeatherExternalDataService.Services.Weather;

var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
var rootEnvPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "global-settings.env"));
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
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Weather & External Data Service",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.Configure<JwtOptions>(
    builder.Configuration.GetSection(JwtOptions.SectionName));

builder.Services.Configure<AviationStackOptions>(
    builder.Configuration.GetSection(AviationStackOptions.SectionName));
builder.Services.Configure<TransportApiOptions>(
    builder.Configuration.GetSection(TransportApiOptions.SectionName));

var jwtOptions = builder.Configuration
    .GetSection(JwtOptions.SectionName)
    .Get<JwtOptions>() ?? new JwtOptions();

if (string.IsNullOrWhiteSpace(jwtOptions.SecretKey))
{
    throw new InvalidOperationException("Jwt:SecretKey must be configured.");
}

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
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtOptions.SecretKey))
        };
    });

builder.Services.AddAuthorization();

builder.Services
    .AddHttpClient("OpenMeteoForecast", client =>
    {
        client.BaseAddress = new Uri("https://api.open-meteo.com/v1/");
        client.Timeout = TimeSpan.FromSeconds(25);
    })
    .AddStandardResilienceHandler();

builder.Services
    .AddHttpClient("OpenMeteoGeocode", client =>
    {
        client.BaseAddress = new Uri("https://geocoding-api.open-meteo.com/v1/");
        client.Timeout = TimeSpan.FromSeconds(25);
    })
    .AddStandardResilienceHandler();

builder.Services
    .AddHttpClient<IFlightStatusClient, AviationStackFlightStatusClient>((sp, client) =>
    {
        var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<AviationStackOptions>>().Value;

        var baseUrl = string.IsNullOrWhiteSpace(options.BaseUrl)
            ? "https://api.aviationstack.com/v1/"
            : options.BaseUrl.TrimEnd('/') + "/";

        client.BaseAddress = new Uri(baseUrl);
        client.Timeout = TimeSpan.FromSeconds(25);
    })
    .AddStandardResilienceHandler();
builder.Services
    .AddHttpClient<ITransportOptionsClient, HybridTransportOptionsClient>((sp, client) =>
    {
        var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<TransportApiOptions>>().Value;
        if (!string.IsNullOrWhiteSpace(options.BaseUrl))
            client.BaseAddress = new Uri(options.BaseUrl.TrimEnd('/') + "/");
        client.Timeout = TimeSpan.FromSeconds(20);
    })
    .AddStandardResilienceHandler();

builder.Services.AddScoped<IWeatherClient, OpenMeteoWeatherClient>();

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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");
app.MapGet("/api/ping", () => Results.Ok(new
{
    status = "ok",
    service = "WeatherExternalDataService"
}));

app.Run();