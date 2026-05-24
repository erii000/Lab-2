# Travel Assistant — backend

## Stack

- .NET 9 microservices, SQL Server (MSSQL), YARP API Gateway, optional **Redis** and **MongoDB** in Docker for future caching/document features.

## Configuration

- Shared environment: `server/global-settings.env` (copy from your team template; never commit secrets).
- Per-service `appsettings.json` and user secrets in development.
- **JWT** (issuer, audience, secret) must match across all services that validate tokens.

## Local development (typical)

1. Start **SQL Server** (LocalDB or Docker MSSQL on port 1433).
2. Run **EF migrations** for each service that uses a database (from repo root or `server`):

   ```bash
   dotnet ef database update --project server/Services/UserService/UserService.csproj
   ```

   Repeat for `ItineraryService`, `BookingService`, `PaymentService`, `NotificationService`, `AuditService`, and any other service you use.

3. Start services (each has its own port in `Properties/launchSettings.json`):

   - **API Gateway** — e.g. `http://localhost:62377` (see launch profile).
   - **UserService** — `http://localhost:62381`
   - **ItineraryService** — `http://localhost:63189`
   - **BookingService** — `http://localhost:63191`
   - **PaymentService** — `http://localhost:63187`
   - **NotificationService** — `http://localhost:62375`
   - **AuditService** — `http://localhost:65486`
   - **RealTimeCommunicationService** (SignalR) — `http://localhost:62379` — hub: `/hubs/notifications`
   - **WeatherExternalDataService** — `http://localhost:61219`
   - **SupportService** — `http://localhost:50395`

4. **Single entry for the SPA**: run the **ApiGateway** and call `http://localhost:62377` (or Docker mapping below). The gateway’s `appsettings.json` reverse-proxy clusters point at the **localhost** ports above for development.

## Docker

From `server/`:

```bash
docker compose up --build
```

- **Gateway** published at `http://localhost:5161` (maps container 8080).
- **MSSQL**, **Redis** (6379), **MongoDB** (27017) are included for local stack parity with `TEAM_BACKLOG_SPLIT.md`.
- Compose injects **YARP cluster addresses** using Docker DNS (`http://userservice:8080/`, etc.). Ensure gateway starts **after** downstream services if you rely on warm paths.

## Main HTTP surfaces

| Area | Through gateway (examples) | Direct service |
|------|-----------------------------|----------------|
| Auth | `POST /api/v1/auth/register`, `login`, `refresh` | UserService |
| Users | `GET /api/v1/users` (Admin), `GET /api/v1/users/me`, `GET /api/v1/users/search`, `GET /api/v1/users/export?format=json|csv|xlsx`, `POST /api/v1/users/import` | UserService |
| Itineraries | `POST /api/v1/itineraries/generate`, `GET …/search`, `GET …/export`, `POST …/import` | ItineraryService |
| Bookings | `POST /api/v1/bookings`, `PATCH …/status`, `GET …/search`, `GET …/export`, `POST …/import` | BookingService |
| Payments | `POST /api/v1/payments/checkout`, webhooks, `GET …/search`, `GET …/export`, `POST …/import` | PaymentService |
| Notifications | `GET …`, `PATCH …/read`, `POST …/broadcast`, `GET …/export`, `POST …/import` | NotificationService |
| Audit | `GET /api/v1/auditlogs`, `GET /api/v1/auditlogs/search` | AuditService |
| Weather / flights / transport | `GET /api/v1/weather/*`, `GET /api/v1/flights/*`, `GET /api/v1/transport/*` | WeatherExternalDataService |
| Realtime | `GET /hubs/notifications` (WebSocket + `?access_token=` for JWT) | RealTimeCommunicationService |

## Gateway readiness

- **Single entry URL** for the SPA: run **ApiGateway** and point the frontend at its base URL (see ports above).
- **Aggregate upstream health**: `GET /api/health/upstreams` — probes each YARP cluster (`/health`, then `/api/ping`). Returns `overall: Healthy | Degraded`.
- **WebSockets**: `UseWebSockets()` is enabled; SignalR is routed at `/hubs/{**catch-all}` with `WebSocketsEnabled` metadata on that route.
- **CORS**: `localhost` and `127.0.0.1` on port 5173 are allowed by default for Vite.

## Automated smoke tests

```powershell
cd server
./scripts/Test-BackendApis.ps1 -BaseUrl "http://localhost:62377"
# Docker gateway:
# ./scripts/Test-BackendApis.ps1 -BaseUrl "http://localhost:5161"
```

The script checks gateway health, `/api/status`, **`/api/health/upstreams`**, and selected proxied routes (401 without JWT on protected routes is expected).

## Global errors

Every microservice in this solution uses **`TravelAssistant.Common`** `GlobalExceptionMiddleware` so failures return a consistent JSON shape (`ApiResponse`) where configured.

## Backlog coverage (`TEAM_BACKLOG_SPLIT.md`)

The team backlog is **functionally covered** in this repo: JWT auth and refresh, user admin list and advanced search, YARP gateway routes, CORS, global error JSON (gateway + user service), itinerary/booking/payment flows, webhooks, weather/flight/transport clients, SignalR hub, notification broadcast, search and import/export (JSON/CSV/XLSX) for the five list domains, audit log API, Docker stack with Redis/Mongo, and this README. Remaining “nice-to-haves” (e.g. full OpenAPI/Postman for every route, ERD diagram file, writing audit events from every service over HTTP) can be added incrementally without blocking frontend integration.
