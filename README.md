# Smart Travel Assistant (Lab-2)

Full-stack travel planning platform: React SPA, .NET 9 microservices, YARP API Gateway, Azure SQL (`lab2DB`), Docker, JWT auth, SignalR notifications, Stripe/PayPal payments, and admin tooling.

## Team checklist (course requirements)

| Requirement | Location |
|-------------|----------|
| Layered architecture (Controller → Service → Repository) | `server/Services/*` |
| JWT + refresh + logout | `UserService` `/api/v1/auth/*` |
| Role-based authorization | `[Authorize(Roles=...)]` on controllers |
| CORS + env secrets | `server/global-settings.env.example` |
| Real-time (SignalR) | `/hubs/notifications`, client `NotificationsContext` |
| API docs | Swagger per service (dev), `docs/postman/` |
| Database ERD | `docs/DATABASE-ERD.md` |
| Additional features (4) | Microservices, advanced search, payments, export/import — see below |
| Project board template | `server/TEAM_BACKLOG_SPLIT.md` |

Invite course reviewer: **elton.boshnjaku@ubt-uni.net** on GitHub.

## Prerequisites

- **Node.js 20+** and npm 10+
- **.NET 9 SDK**
- **Docker Desktop** (recommended for full backend stack)
- SQL: Azure `lab2DB` (team) or LocalDB / Docker MSSQL (solo)

## Quick start

### 1. Configuration

```powershell
cd server
copy global-settings.env.example global-settings.env
# Edit global-settings.env — set ConnectionStrings__DefaultConnection and Jwt__SecretKey
```

Never commit `global-settings.env` (gitignored).

### 2. Backend (Docker)

```powershell
cd server
docker compose up --build
```

- **API Gateway:** http://localhost:5161  
- **Swagger (UserService example):** http://localhost:62381/swagger  

### 3. Frontend

```powershell
cd client
npm ci
npm run dev
```

- **App:** http://localhost:5173 (Vite proxies `/api` and `/hubs` to the gateway)

### 4. Smoke test

```powershell
cd server
./scripts/Test-BackendApis.ps1 -BaseUrl "http://localhost:5161"
```

### Demo admin (after DB seed)

- Email: `admin@smarttravel.app`  
- Password: `admin12345`

## Architecture

```
client (Vite/React)
    → ApiGateway :5161 (YARP)
        → UserService, ItineraryService, BookingService, PaymentService
        → NotificationService (+ SignalR /hubs/notifications)
        → RealTimeCommunicationService (chat API + /hubs/chat)
        → AuditService, SupportService, WeatherExternalDataService
```

## Implemented additional features (4)

1. **Microservices** — API Gateway, Docker Compose, inter-service HTTP, separate DB contexts per domain.  
2. **Advanced search** — Users, bookings, payments, itineraries, notifications (+ audit); client destination explore filters.  
3. **Online payments** — Stripe/PayPal checkout & webhooks, lab checkout fallback, transaction logs.  
4. **Data export/import** — Five admin lists: JSON, CSV, Excel (`TravelAssistant.Common.Export`). Admin UI: **Data exchange** (`/admin/data`) and per-list bars on Users, Bookings, Trips.

## Real-time

- **Notifications:** SignalR hub `travelUpdate` — connect with `?access_token=<JWT>`.  
- **Chat:** REST + optional `chatMessage` push on `/hubs/chat`.  
- Frontend shows a **live** indicator on the notification bell when the hub is connected.

## Documentation

| File | What it covers |
|------|---------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System overview, layers, request flows, Docker map |
| [docs/BACKEND.md](docs/BACKEND.md) | Every service, controller, route table, service/repo classes |
| [docs/FRONTEND.md](docs/FRONTEND.md) | Pages, stores, API modules, hooks, services, utils |
| [docs/FEATURES.md](docs/FEATURES.md) | Auth, real-time, payments, export/import, search — step-by-step |
| [docs/DATABASE.md](docs/DATABASE.md) | All tables, columns, ownership, connection, migrations |
| [docs/DATABASE-ERD.md](docs/DATABASE-ERD.md) | Mermaid entity relationship diagram |
| [docs/PRESENTATION_GUIDE.md](docs/PRESENTATION_GUIDE.md) | Professor Q&A prep + demo script |
| [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md) | Jira/Trello/GitHub Projects setup |
| [docs/postman/TravelAssistant.postman_collection.json](docs/postman/TravelAssistant.postman_collection.json) | Postman API collection (all routes) |
| [server/README.md](server/README.md) | Service ports, Docker, routes |
| [server/DATABASE.md](server/DATABASE.md) | Azure SQL team setup |

## CI

Pull requests touching `client/` run lint + build via `.github/workflows/client-ci.yml`.
