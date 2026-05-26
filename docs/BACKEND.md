# Backend — Service-by-Service Reference

Every service is a standalone .NET 9 ASP.NET Core Web API. They all share:
- JWT authentication middleware (same signing key, different validations)
- `TravelAssistant.Common` project (security headers, export, audit, notifications, SignalR user ID)
- Swagger UI on `/swagger` in Development mode
- A Dockerfile and is registered in `docker-compose.yml`

---

## 1. API Gateway

**Location:** `server/ApiGateway/`  
**Port:** 5161 (Docker) / 62377 (local launchSettings)

The gateway is **not** a business service. It does only two things:
1. **Reverse-proxy** every request to the right downstream service, using YARP routing rules from `appsettings.json`
2. **Apply shared middleware** (CORS, security headers, global exception handler, WebSocket upgrade for SignalR)

### Files

| File | Purpose |
|------|---------|
| `Program.cs` | Service setup, CORS, YARP, Swagger, route mapping |
| `appsettings.json` | Full YARP route → cluster map |
| `Configuration/JwtOptions.cs` | JWT config model (not used for validation in gateway) |
| `Controllers/StatusController.cs` | `GET /api/status` — returns service info |
| `Controllers/AggregatedHealthController.cs` | `GET /api/health/upstreams` — probes all clusters |

### Route table (abbreviated)

| URL pattern | Routed to |
|-------------|-----------|
| `/api/v1/auth/**` | UserService |
| `/api/v1/users/**` | UserService |
| `/api/v1/itineraries/**` | ItineraryService |
| `/api/v1/destinations/**` | ItineraryService |
| `/api/v1/bookings/**` | BookingService |
| `/api/v1/reports/**` | BookingService |
| `/api/v1/payments/**` | PaymentService |
| `/api/v1/notifications/**` | NotificationService |
| `/hubs/notifications` | NotificationService (WebSocket) |
| `/api/v1/chat/**` | RealTimeCommunicationService |
| `/hubs/chat` | RealTimeCommunicationService (WebSocket) |
| `/api/v1/auditlogs/**` | AuditService |
| `/api/v1/supporttickets/**` | SupportService |
| `/api/v1/weather/**` | WeatherExternalDataService |
| `/api/v1/flights/**` | WeatherExternalDataService |
| `/api/v1/transport/**` | WeatherExternalDataService |

---

## 2. UserService

**Location:** `server/Services/UserService/`  
**Port:** 62381  
**Owns tables:** `Users`, `RefreshTokens`, `Roles`, `UserRoles`

Handles everything related to identity: registration, login, token issuance/rotation, logout, user management, and role assignment.

### Controllers

#### `AuthController` — `api/auth` / `api/v1/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | Public | Create account, hash password, issue tokens |
| POST | `/login` | Public | Verify password, issue tokens |
| POST | `/refresh` | Public | Rotate refresh token, issue new access token |
| POST | `/logout` | Bearer | Revoke refresh token |

Rate-limited with `[EnableRateLimiting("auth")]` (prevents brute-force).

#### `UserController` — `api/v1/users`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/me` | Bearer | Own profile + roles |
| PUT | `/me` | Bearer | Update own first/last name |
| PATCH | `/{id}` | Admin | Activate/deactivate user, patch name |
| GET | `/` | Admin | Paged user list with filters |
| GET | `/search` | Admin | Full-text search across users |
| GET | `/export` | Admin | Download as JSON / CSV / XLSX |
| POST | `/import` | Admin | Bulk create users from JSON array |

#### `AdminController` — `api/v1/admin/users`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Admin | Paged user list (same as UserController list) |

### Services

| Class | Interface | Responsibility |
|-------|-----------|---------------|
| `AuthService` | `IAuthService` | Register, login, refresh, logout; BCrypt, JWT, refresh token logic |
| `UserSearchService` | `IUserSearchService` | Paginated, filtered, sorted user search via EF LINQ |

### Repositories

| Class | Interface | Notes |
|-------|-----------|-------|
| `SqlUserRepository` | `IUserRepository` | EF Core; full CRUD + `GetByEmailAsync` |
| `InMemoryUserRepository` | `IUserRepository` | In-memory fallback for dev/testing |
| `SqlRefreshTokenRepository` | `IRefreshTokenRepository` | EF Core; add/find/revoke refresh tokens |
| `InMemoryRefreshTokenRepository` | `IRefreshTokenRepository` | BCrypt.Verify on every lookup |

### Models / Entities

| Class | Table | Notes |
|-------|-------|-------|
| `User` | `Users` | `PasswordHash` (never plain text), `IsActive`, navigation to `UserRoles` |
| `RefreshToken` | `RefreshTokens` | `TokenHash` (BCrypt), `ExpiresAt`, `RevokedAt` |
| `Roles` | `Roles` | `Name` (Admin, Support, User) |
| `UserRoles` | `UserRoles` | Many-to-many join |
| `RolePermissions` | `RolePermissions` | Not exposed in API; future use |
| `Permissions` | `Permissions` | Not exposed in API; future use |
| `TravelPreferences` | — | Not persisted in UserService (see ItineraryService) |

### Validation

`FluentValidation` + `AddFluentValidationAutoValidation()`:
- `RegisterRequestValidator` — email format, password min length, name required
- `RegisterRequest` uses `[Required]` data annotations as a second layer

---

## 3. ItineraryService

**Location:** `server/Services/ItineraryService/`  
**Port:** 63189  
**Owns tables:** `Itineraries`, `ItineraryDays`, `ItineraryDayActivities`, `TravelPreferences`, `Trips`, `Destinations`, `TripDestinations`, `TripParticipants`, `UserSavedDestinations`

Handles trip planning, AI-generated itineraries, the destination catalog, and user saved destinations.

### Controllers

#### `ItinerariesController` — `api/v1/itineraries`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/generate` | Bearer | Generate an itinerary (AI-assisted planning) |
| PUT | `/{id}/timeline` | Bearer | Save the day/activity timeline JSON |
| GET | `/{id}` | Bearer | Get itinerary detail |
| GET | `/user/{userId}` | Bearer | List itineraries for a user |
| GET | `/search` | Admin | Paginated, filtered search |
| GET | `/export` | Admin | JSON / CSV / XLSX download |
| POST | `/import` | Admin | Bulk import (calls `generate` per row) |

#### `DestinationsController` — `api/v1/destinations`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Public | Full destination catalog |
| GET | `/{slug}` | Public | Single destination by slug |
| PATCH | `/{slug}/admin-meta` | Admin | Merge admin overrides (status, image, etc.) |

Destinations are stored in a JSON catalog (`CatalogJson` column) and supplemented with admin metadata from the `Destinations` DB table.

#### `SavedDestinationsController` — `api/v1/saved-destinations`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Bearer | List saved destination slugs |
| PUT | `/{slug}` | Bearer | Save a destination (wishlist) |
| DELETE | `/{slug}` | Bearer | Remove from wishlist |

#### `TravelPreferencesController` — `api/v1/travel-preferences`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/me` | Bearer | Own preferences |
| PUT | `/me` | Bearer | Create or update own preferences |
| GET | `/user/{userId}` | Admin | Another user's preferences |
| PUT | `/user/{userId}` | Admin | Update another user's preferences |

### Services

| Class | Interface | Responsibility |
|-------|-----------|---------------|
| `ItineraryPlanningService` | `IItineraryPlanningService` | Creates itinerary + days + activities; stores in DB |
| `ItinerarySearchService` | `IItinerarySearchService` | EF LINQ search with filters, pagination, sort |

### Validation

- `GenerateItineraryRequestValidator` (FluentValidation) — destination required, date range valid, guests > 0

---

## 4. BookingService

**Location:** `server/Services/BookingService/`  
**Port:** 63191  
**Owns tables:** `Bookings`, `Hotels`, `Flights`, `TransportOptions`, `SavedTrips`

Manages reservations from creation through confirmation/cancellation/refund. Also generates admin booking reports.

### Controllers

#### `BookingsController` — `api/v1/bookings`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Bearer | Own bookings (user sees own, admin sees all) |
| POST | `/` | Bearer | Create booking |
| GET | `/{id}` | Bearer | Booking detail |
| PATCH | `/{id}` | Bearer | Update booking fields |
| PATCH | `/{id}/status` | Bearer | Status transition (role-checked) |
| POST | `/{id}/confirm-payment` | Bearer | Mark payment confirmed |
| POST | `/{id}/discard` | Bearer | Discard a pending draft |
| GET | `/search` | Admin | Filtered/paged search |
| GET | `/export` | Admin | JSON / CSV / XLSX |
| POST | `/import` | Admin | Bulk import |

#### `AdminReportsController` — `api/v1/reports`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/bookings` | Admin | Custom report with date/status filters; returns JSON / CSV / XLSX |

### Services

| Class | Interface | Responsibility |
|-------|-----------|---------------|
| `BookingWorkflowService` | `IBookingWorkflowService` | Business rules — status transitions, validation |
| `BookingImportService` | `IBookingImportService` | Bulk import validation + creation |

### Booking status flow

```
Pending ──► Confirmed ──► Completed
   │             │
   ▼             ▼
Cancelled    Cancelled
              │
              ▼
            Refunded / PartiallyRefunded
```

`BookingStatusTransitions` class enforces which transitions are allowed per role.

### Validation

- `CreateBookingRequestValidator` (FluentValidation)
- `UpdateBookingStatusRequestValidator` (FluentValidation)

---

## 5. PaymentService

**Location:** `server/Services/PaymentService/`  
**Port:** 63187  
**Owns tables:** `Payments`, `Expenses`, `PaymentTransactionLogs`

Handles checkout, payment provider integrations (Stripe, PayPal, Lab), webhooks, and the payment ledger.

### Controllers

#### `PaymentsController` — `api/v1/payments`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/checkout` | Bearer | Start checkout (Stripe / PayPal / Lab) |
| GET | `/{paymentId}` | Bearer | Payment detail (owner or Admin) |
| GET | `/user/{userId}` | Bearer | Payments for a user |
| GET | `/search` | Admin | Filtered/paged search |
| GET | `/export` | Admin | JSON / CSV / XLSX |
| POST | `/import` | Admin | Bulk import payment records |
| POST | `/webhook` | Public | Stripe webhook (signature validated) |
| POST | `/webhook/paypal` | Public | PayPal webhook (signature validated) |

Webhook endpoints are public (`AllowAnonymous`) but verify provider signatures before processing — this is required by Stripe/PayPal.

### Services

| Class | Interface | Notes |
|-------|-----------|-------|
| `LabPaymentCheckoutService` | `IPaymentCheckoutService` | Dev/lab default — immediately marks Completed |
| `StripePaymentCheckoutService` | `IPaymentCheckoutService` | Creates hosted Stripe Checkout Session |
| `PayPalPaymentCheckoutService` | `IPaymentCheckoutService` | Creates PayPal order |
| `IPaymentWebhookService` | — | Processes Stripe and PayPal webhook events |
| `PaymentQueryService` | — | Stateless mapper: `Payment` entity → DTO |

Provider is selected at startup based on which credentials are configured in environment variables.

### Validation

- `CreateCheckoutSessionRequestValidator` (FluentValidation)

---

## 6. NotificationService

**Location:** `server/Services/NotificationService/`  
**Port:** 62375  
**Owns tables:** `Notifications`

Persists notifications and delivers them in real-time via SignalR. Also hosts the `/hubs/notifications` SignalR hub (the gateway proxies WebSocket connections here).

### Controllers

#### `NotificationsController` — `api/notifications` / `api/v1/notifications`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Admin | All notifications |
| GET | `/user/{userId}` | Bearer (owner or Admin) | User's notifications |
| GET | `/search` | Admin | Paginated search |
| GET | `/export` | Admin | JSON / CSV / XLSX |
| POST | `/import` | Admin | Bulk import |
| POST | `/` | Bearer | Create + push to user via SignalR |
| POST | `/broadcast` | Admin | Push to all connected clients |
| PATCH | `/{id}/read` | Bearer | Mark as read |
| POST | `/internal/publish` | `X-Notification-Key` | Internal service-to-service endpoint |

The `internal/publish` endpoint does not require a JWT — it uses a shared secret header (`X-Notification-Key`). This is how PaymentService and BookingService send notifications without holding a user JWT.

### Hub

- **Class:** `NotificationsHub`
- **Path:** `/hubs/notifications`
- **Event name:** `travelUpdate`
- **Auth:** `[Authorize]` — requires valid JWT as `?access_token=` query param (standard SignalR pattern)
- **User targeting:** `JwtUserIdProvider` extracts user ID from JWT, enables `Clients.User(userId).SendAsync(...)`

---

## 7. RealTimeCommunicationService

**Location:** `server/Services/RealTimeCommunicationService/`  
**Port:** 62379  
**Owns tables:** `ChatMessages`

Hosts the chat API and both SignalR hubs (notifications and chat).

### Controllers

#### `ChatController` — `api/chat` / `api/v1/chat`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Admin | All chat messages |
| GET | `/mine` | Bearer | Own message history |
| POST | `/` | Bearer | Send message; generates AI reply; pushes via SignalR |

### Hubs

| Class | Path | Event | Auth |
|-------|------|-------|------|
| `NotificationsHub` | `/hubs/notifications` | `travelUpdate` | `[Authorize]` |
| `ChatHub` | `/hubs/chat` | `chatMessage` | `[Authorize]` |

### Services

- `ChatService` / `IChatService` — CRUD on `ChatMessages`
- `EfChatRepository` — EF Core implementation

### How the AI reply works

`ChatController.Create` receives the user's message. It stores the user message, then immediately creates an AI reply message (the `AiReply` field can be provided by the client, which sends GPT-style suggestions — or a fallback text is used). Both messages are persisted. The AI reply is then pushed to the browser via `IHubContext<ChatHub>.Clients.User(userId).SendAsync("chatMessage", ...)`.

---

## 8. AuditService

**Location:** `server/Services/AuditService/`  
**Port:** 65486  
**Owns tables:** `AuditLogs`

Stores an immutable log of actions. Other services write to it via `HttpAuditWriter` from TravelAssistant.Common.

### Controllers

#### `AuditLogsController` — `api/auditlogs` / `api/v1/auditlogs`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Admin | All logs |
| GET | `/search` | Admin | Paginated/filtered search |
| POST | `/` | Admin JWT OR `X-Audit-Key` | Create a log entry |

The POST is `AllowAnonymous` but checks either `User.IsAuthenticated && IsInRole("Admin")` or the `X-Audit-Key` internal header. This lets other microservices (without holding a user JWT) write audit records securely.

---

## 9. SupportService

**Location:** `server/Services/SupportService/`  
**Port:** 50395  
**Owns tables:** `SupportTickets`

Handles contact form submissions and internal support ticket management.

### Controllers

#### `SupportTicketsController` — `api/supporttickets` / `api/v1/supporttickets`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Admin or Support | All tickets |
| GET | `/user/{userId}` | Bearer (own or Admin/Support) | Tickets for a user |
| POST | `/` | Bearer | Create ticket |
| POST | `/contact` | Public | Contact form (no auth required) |
| PATCH | `/{id}/status` | Admin or Support | Update status |

The `/contact` endpoint is public so guests can submit the contact form.

---

## 10. WeatherExternalDataService

**Location:** `server/Services/WeatherExternalDataService/`  
**Port:** 61219  
**Owns tables:** `WeatherData`

Integrates with external APIs for weather and flight information.

### Controllers

#### `WeatherController` — `api/v1/weather`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/current` | Bearer | Current weather for a city |
| GET | `/forecast` | Bearer | Multi-day forecast |

Uses **Open-Meteo** (free, no API key required).

#### `FlightsController` — `api/v1/flights`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/{flightNumber}/status` | Bearer | Flight status from AviationStack |

Requires `ExternalApis__AviationStack__AccessKey`.

#### `TransportController` — `api/v1/transport`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/options` | Bearer | Transport options between coordinates |

---

## TravelAssistant.Common (shared library)

**Location:** `TravelAssistant.Common/`

This is not a web service — it is a class library referenced by all services via a project reference. It contains shared infrastructure code.

### Export — `Export/TabularExport.cs`

Three static methods used by every export endpoint:
- `ToJsonUtf8<T>(items)` — camelCase JSON bytes
- `ToCsv(headers, rows)` — UTF-8 BOM, RFC 4180 escaping (commas and quotes in cells handled)
- `ToXlsx(sheetName, headers, rows)` — Excel workbook using ClosedXML library

### Audit — `Audit/`

- `IAuditWriter` — interface with `WriteAsync(userId, action, entityName, details, ct)`
- `HttpAuditWriter` — sends `POST /api/v1/auditlogs` with `X-Audit-Key` header; if the AuditService is unreachable, the error is logged but not thrown (fire-and-forget — business flow must not fail because of audit)
- `AuditWriterOptions` — `BaseUrl`, `InternalKey` (read from env)
- `ServiceCollectionExtensions` — `AddAuditWriter(config)` registers it in DI

### Notifications — `Notifications/`

- `ITravelUpdatePublisher` — `NotifyUserAsync`, `BroadcastAsync`
- `HttpTravelUpdatePublisher` — POSTs to `api/v1/notifications/internal/publish`; fire-and-forget
- `ServiceCollectionExtensions` — `AddTravelUpdatePublisher(config)` registers in DI

### Middleware — `Middleware/`

- `SecurityHeadersMiddleware` — sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
- `GlobalExceptionMiddleware` — wraps the entire pipeline; catches any unhandled exception; returns `{ status: 500, message: "..." }` JSON

### SignalR — `SignalR/JwtUserIdProvider.cs`

Implements `IUserIdProvider`. SignalR calls `GetUserId(connection)` to determine the target user for `Clients.User(id)` calls. This reads `ClaimTypes.NameIdentifier` from the JWT (the user's integer ID).

### Database — `Database/Lab2DbSchemaBootstrap.cs`

Runs raw SQL DDL to create all tables in the Azure shared `lab2DB` database if they do not exist. Used during initial project setup on the team lab server.
