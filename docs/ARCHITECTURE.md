# Architecture — Smart Travel Assistant

## Big-picture overview

```
Browser (React SPA)
    │
    │  HTTP / WebSocket
    ▼
API Gateway :5161  (YARP reverse proxy)
    │
    ├── UserService         :62381   (auth, users, roles)
    ├── ItineraryService    :63189   (trips, destinations, preferences)
    ├── BookingService      :63191   (reservations, reports)
    ├── PaymentService      :63187   (checkout, webhooks, logs)
    ├── NotificationService :62375   (alerts, SignalR hub)
    ├── RealTimeCommunicationService :62379  (chat, SignalR hub)
    ├── AuditService        :65486   (audit log)
    ├── SupportService      :50395   (contact/support tickets)
    └── WeatherExternalDataService :61219  (weather, flights, transport)
    │
    └── All services ──► Azure SQL  lab2DB  (shared database, separate tables)
```

The project follows the **Microservices + API Gateway** pattern. Every HTTP request from the browser hits the **API Gateway** only. The gateway routes the request to the correct backend service using **YARP** (Yet Another Reverse Proxy) based on URL path prefixes — no business logic lives in the gateway.

---

## Layered architecture (inside each service)

Each microservice independently follows **Controller → Service → Repository** (3-layer architecture), which is a course requirement.

```
HTTP Request
    │
    ▼
Controller          ← receives request, validates input format, calls service
    │
    ▼
Service             ← all business logic, rules, orchestration
    │
    ▼
Repository          ← database access only (EF Core LINQ queries)
    │
    ▼
Database (SQL)
```

**Why this matters:**
- Controllers never run SQL. They receive HTTP, call a service method, return a response.
- Services never know about HTTP. They hold all rules (e.g. "a cancelled booking cannot be confirmed").
- Repositories never hold business rules. They only read/write the database.

---

## Technology stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Material UI v6, React Router v6, Zustand |
| API Gateway | .NET 9, YARP (Microsoft reverse proxy library) |
| Backend services | .NET 9 ASP.NET Core Web API |
| ORM | Entity Framework Core 9 (code-first migrations) |
| Database | Microsoft SQL Server (Azure lab2DB) |
| Real-time | ASP.NET Core SignalR |
| Containerisation | Docker + Docker Compose |
| Shared library | `TravelAssistant.Common` (NuGet-style project reference) |
| Password hashing | BCrypt.Net |
| Auth | JWT (HS256) + opaque refresh tokens |
| Export | ClosedXML (XLSX), custom CSV, System.Text.Json |
| Payments | Stripe, PayPal, Lab (dev fallback) |
| CI | GitHub Actions (`client-ci.yml`) |

---

## Request lifecycle — example: user logs in

```
1. Browser           POST /api/v1/auth/login  { email, password }
2. API Gateway       receives request, matches route pattern /api/v1/auth/**
3. API Gateway       reverse-proxies to UserService :62381
4. UserService       AuthController.Login()
                       → AuthService.LoginAsync()
                           → UserRepository.GetByEmailAsync()     (DB read)
                           → BCrypt.Verify(password, hash)        (business logic)
                           → GenerateAccessToken()                (business logic)
                           → RefreshTokenRepository.AddAsync()    (DB write)
                       ← returns { accessToken, refreshToken, expiresAtUtc }
5. API Gateway       forwards response back
6. Browser           stores tokens in Zustand store (localStorage)
```

---

## Request lifecycle — example: admin exports bookings as CSV

```
1. Browser           GET /api/v1/bookings/export?format=csv
                     (Authorization: Bearer <accessToken>)
2. API Gateway       routes to BookingService :63191
3. BookingService    BookingsController.Export()   [Authorize(Roles="Admin")]
                       → BookingRepository.ListForExportAsync()  (DB read)
                       → TabularExport.ToCsv(headers, rows)      (Common library)
                       ← File(bytes, "text/csv", "bookings-20260526.csv")
4. Browser           browser triggers file download
```

---

## Request lifecycle — example: payment triggers real-time notification

```
1. Browser           POST /api/v1/payments/checkout  { bookingId, amount }
2. PaymentService    LabPaymentCheckoutService.CreateCheckoutAsync()
                       → creates Payment record
                       → ITravelUpdatePublisher.NotifyUserAsync(userId, "Payment confirmed")
                           → HttpTravelUpdatePublisher POSTs to NotificationService
3. NotificationService  /api/v1/notifications/internal/publish  (X-Notification-Key)
                          → persists Notification to DB
                          → IRealtimeNotificationService.SendToUserAsync()
                              → IHubContext<NotificationsHub>.Clients.User(userId)
                                  .SendAsync("travelUpdate", payload)
4. SignalR           pushes "travelUpdate" event over WebSocket to browser
5. Browser           NotificationsContext receives event
                       → toast appears, bell badge increments, store refreshes
```

---

## Security pipeline (per service)

Every request that reaches a microservice goes through this pipeline:

```
Incoming HTTP
    │
    ▼
GlobalExceptionMiddleware   ← catch-all; returns { status, message } JSON
    │
    ▼
SecurityHeadersMiddleware   ← adds X-Content-Type-Options, X-Frame-Options, etc.
    │
    ▼
UseAuthentication()         ← reads JWT from Authorization: Bearer header
    │
    ▼
UseAuthorization()          ← checks [Authorize] / [Authorize(Roles="Admin")]
    │
    ▼
Controller Action
```

---

## CORS configuration

CORS is configured on the API Gateway (and on NotificationService separately for the SignalR hub). Only whitelisted origins are allowed:

```
http://localhost:5173
http://127.0.0.1:5173
http://localhost:5174
http://127.0.0.1:5174
```

Production origins should be added to `Cors__AllowedOrigins__*` in `global-settings.env`.

---

## Environment configuration

All secrets are in `server/global-settings.env` (gitignored). The file is loaded as environment variables by Docker Compose. Never commit this file.

Key settings:

| Variable | Purpose |
|----------|---------|
| `ConnectionStrings__DefaultConnection` | Azure SQL connection string |
| `Jwt__SecretKey` | HS256 signing key (min 32 chars) |
| `Jwt__AccessTokenMinutes` | Access token lifetime |
| `Jwt__RefreshTokenDays` | Refresh token lifetime |
| `Cors__AllowedOrigins__0..3` | Allowed browser origins |
| `Audit__InternalKey` | Shared secret for service→AuditService calls |
| `Notification__InternalKey` | Shared secret for service→NotificationService calls |
| `Stripe__SecretKey` | Stripe (optional) |
| `PayPal__ClientId/Secret` | PayPal (optional) |

---

## Shared library — TravelAssistant.Common

All services reference this project. It provides:

| Module | What it does |
|--------|-------------|
| `Export/TabularExport` | Generates CSV, XLSX (ClosedXML), JSON bytes |
| `Audit/HttpAuditWriter` | Fire-and-forget HTTP calls to AuditService |
| `Notifications/HttpTravelUpdatePublisher` | Fire-and-forget HTTP to NotificationService |
| `Middleware/SecurityHeadersMiddleware` | Security HTTP headers |
| `Middleware/GlobalExceptionMiddleware` | Consistent JSON error responses |
| `SignalR/JwtUserIdProvider` | Maps JWT sub claim → SignalR user ID |
| `Database/Lab2DbSchemaBootstrap` | Bootstrap DDL for Azure lab2DB |

---

## Docker Compose services map

```
docker compose up --build
```

| Container | Port | Service |
|-----------|------|---------|
| `apigateway` | 5161 | Entry point for all requests |
| `userservice` | 62381 | Auth + users |
| `itineraryservice` | 63189 | Trips + destinations |
| `bookingservice` | 63191 | Reservations |
| `paymentservice` | 63187 | Payments |
| `notificationservice` | 62375 | Alerts + SignalR hub |
| `realtimecommunicationservice` | 62379 | Chat + SignalR hub |
| `auditservice` | 65486 | Audit log |
| `supportservice` | 50395 | Support tickets |
| `weatherexternaldataservice` | 61219 | Weather/flights |
| `redis` | 6379 | Available (future caching) |
| `mongo` | 27017 | Available (future doc storage) |
| `mssql` | 1433 | Local SQL (profile: local-sql) |
