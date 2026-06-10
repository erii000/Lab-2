# API Gateway

This project is **intentionally small**. In a microservices architecture the gateway is a **reverse proxy**, not a business-logic service.

## What it does

- **YARP** (`Microsoft.AspNetCore.ReverseProxy`) loads routes from `appsettings.json` → `ReverseProxy` section.
- Forwards HTTP and **WebSocket** traffic to nine backend clusters (user, itinerary, booking, payment, notification, audit, RTC, weather, support).
- Exposes a few **gateway-owned** endpoints:
  - `GET /health` — gateway liveness
  - `GET /api/status` — gateway status (`StatusController`)
  - `GET /api/health/upstreams` — probes each downstream cluster (`AggregatedHealthController`)
  - `GET /api/gateway-test` — smoke-test route

## What it does *not* do (by design)

- No database, EF, or domain models
- No JWT validation (each microservice validates tokens)
- No booking/user/chat logic — that lives in `server/Services/*`

Docker Compose overrides cluster addresses via `ReverseProxy__Clusters__*__Address` environment variables so containers talk over Docker DNS (`http://userservice:8080/`, etc.).

## Folder layout

| Path | Purpose |
|------|---------|
| `Program.cs` | YARP + CORS + WebSockets + middleware |
| `appsettings.json` | All route/cluster definitions |
| `Controllers/` | Health/status probes only |
| `Configuration/JwtOptions.cs` | Reserved for future gateway auth (unused today) |

Empty `Services/` or `Configurations/` folders are **not required** — routing is declarative in config, not code.
