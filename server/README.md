# Smart Travel Assistant Backend

This backend follows a layered architecture:

- Controllers: HTTP request/response only.
- Services: business logic and app rules.
- Repositories: data access abstraction (currently in-memory, DB-ready).

## Tech Stack

- ASP.NET Core Web API (.NET 9)
- JWT authentication with access + refresh tokens
- SignalR for real-time notifications
- Swagger/OpenAPI documentation

## Prerequisites

- .NET SDK 9.0+

## Environment Variables

Copy `.env.example` to `.env` and replace values:

- `ConnectionStrings__DefaultConnection`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__SecretKey`
- `Jwt__AccessTokenMinutes`
- `Jwt__RefreshTokenDays`
- `Cors__AllowedOrigins__0`

Secrets must never be committed to Git.

## Run

From the `server` folder:

```bash
dotnet restore
dotnet run
```

Swagger UI will be available at:

- `https://localhost:7272/swagger`
- `http://localhost:5161/swagger`

## Current Endpoints

- `GET /api/status`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/notifications/broadcast` (Admin role required)
- `GET /api/ping`

SignalR hub:

- `/hubs/notifications`

## Notes About Database

You can keep building backend features before finishing MSSQL.

- Current repositories run in-memory.
- When ready, add EF Core repository implementations under `Repositories/EF`.
- Keep service interfaces unchanged and swap DI registrations in `Program.cs`.
