# Features — Detailed Implementation Guide

This document explains exactly how each implemented feature works, from the first line of code to what the user sees.

---

## Feature 1: Microservices Architecture

**Requirement met:** API Gateway, Docker containerization, inter-service communication.

### What we built

Instead of one monolithic server, the backend is split into **9 independent microservices**. Each service:
- Has its own `.csproj` file, its own `Program.cs`, its own Dockerfile
- Runs on its own port
- Owns its own database tables
- Can be deployed/scaled independently

### API Gateway (YARP)

All browser requests go to **one URL** (`http://localhost:5161`). The API Gateway receives every request and routes it to the correct service based on the URL path prefix.

```
Browser → GET /api/v1/bookings → Gateway → BookingService
Browser → GET /api/v1/users/me → Gateway → UserService
Browser → POST /api/v1/payments/checkout → Gateway → PaymentService
```

The routing config lives in `server/ApiGateway/appsettings.json` under `ReverseProxy`. No code is needed to add a new route — only JSON config.

### Inter-service communication

Services do not call each other's REST APIs directly except through two shared publisher interfaces:

**AuditWriter** (`TravelAssistant.Common/Audit/HttpAuditWriter.cs`):
```
Any service → IAuditWriter.WriteAsync() → HTTP POST /api/v1/auditlogs (X-Audit-Key header)
```

**TravelUpdatePublisher** (`TravelAssistant.Common/Notifications/HttpTravelUpdatePublisher.cs`):
```
Any service → ITravelUpdatePublisher.NotifyUserAsync() → HTTP POST /api/v1/notifications/internal/publish
```

Both are **fire-and-forget** — if the target service is down, the error is logged but the caller's business flow is not interrupted.

### Docker Compose

`server/docker-compose.yml` defines all 9 services + gateway + optional databases. Run with:

```bash
cd server
docker compose up --build
```

Inside Docker, services communicate via Docker DNS names (e.g. `http://userservice:8080/`) instead of `localhost` ports. The gateway's `appsettings.json` in Docker mode uses these DNS names.

---

## Feature 2: Advanced Search (≥ 5 lists)

**Requirement met:** Advanced search with filters, sorting, and full-text search on 5+ lists.

### Server-side search (API)

Every major resource has a search endpoint with a request DTO containing:
- `Query` — free text
- Date range filters (`DateFrom`, `DateTo`)
- Status filter
- `Page`, `PageSize`
- `SortBy`, `SortOrder`

Implemented via EF Core LINQ in each service's repository (e.g. `EfBookingRepository.SearchAsync`, `ItinerarySearchService.SearchAsync`, `UserSearchService.SearchAsync`).

**5 server-side search endpoints:**
1. `GET /api/v1/users/search` — users (UserService)
2. `GET /api/v1/bookings/search` — bookings (BookingService)
3. `GET /api/v1/payments/search` — payments (PaymentService)
4. `GET /api/v1/itineraries/search` — itineraries (ItineraryService)
5. `GET /api/v1/notifications/search` — notifications (NotificationService)
6. `GET /api/v1/auditlogs/search` — audit logs (AuditService)

### Client-side search

All admin list pages and the user bookings dashboard use a unified `applyAdvancedListQuery` function from `client/src/utils/advancedSearch.js`.

```javascript
// Example: Admin Bookings page
const filtered = applyAdvancedListQuery({
  items: visibleBookings,
  query,                          // from search input
  getSearchableText: (b) =>
    `${b.id} ${b.user} ${b.destination} ${b.status}`,
  sortKey,                        // e.g. "amount-desc"
  sortDir: "desc",
  getSortValue: (b, key) => ...,  // resolve value for sort key
  predicate: (b) =>               // status chip filter
    statusFilter === "all" || b.status === statusFilter,
});
```

**How full-text matching works:**
1. Input string is normalized: lowercased, diacritics stripped (`"Ëlona"` → `"elona"`)
2. Split into tokens by whitespace
3. Every token must appear in the searchable text (AND logic)
4. Comparison is locale-aware

**5 admin lists with client-side search + sort + filters:**
1. Admin Users — search by name/email/status; sort by spend, joined date, name
2. Admin Bookings — search by ID/user/destination/status; sort by ID, amount, user, destination
3. Admin Trips — search by title/destination/style/status; sort by bookings, price, title
4. User Bookings Dashboard — search by destination/status/dates
5. Explore/Search — destination search by name/country/category/budget

---

## Feature 3: Online Payment Integration

**Requirement met:** Stripe, PayPal, transaction validation, error handling, payment logs.

### Payment providers

The system supports three payment providers. The active provider is selected at startup based on what credentials are configured:

| Provider | Config key | When used |
|----------|-----------|-----------|
| Lab | (no key needed) | Default — dev/demo mode |
| Stripe | `Stripe__SecretKey` | Production Stripe |
| PayPal | `PayPal__ClientId` | Production PayPal |

### Lab payment flow (default for demos)

This is what runs when you demo the app without real Stripe/PayPal credentials:

```
1. User clicks "Pay" on BookingTravelerPage
2. SecureCheckoutForm validates card (Luhn check, expiry, CVC)
3. paymentCheckout.js:
   a. ensureServerBooking() — if booking not on server yet, creates it
   b. POST /api/v1/payments/checkout { bookingId, provider: "lab", amount, currency }
4. PaymentService: LabPaymentCheckoutService.CreateCheckoutAsync()
   a. Creates Payment record (status: "Completed")
   b. Creates PaymentTransactionLog record
   c. Calls ITravelUpdatePublisher.NotifyUserAsync() → notification to user
   d. Calls ITravelUpdatePublisher.BroadcastAsync() → admin dashboard updates
   e. Calls IAuditWriter.WriteAsync() → audit log
   f. Returns { paymentId, status: "Completed", externalReference: "LAB-..." }
5. Frontend: POST /api/v1/bookings/:id/confirm-payment
6. Frontend: creates "Payment confirmed" notification via API
7. Redirects to BookingSuccessPage
```

### Stripe flow

```
1. POST /api/v1/payments/checkout { provider: "stripe", ... }
2. StripePaymentCheckoutService creates Stripe Checkout Session
3. Returns { checkoutUrl: "https://checkout.stripe.com/..." }
4. Frontend redirects user to Stripe hosted page
5. Stripe calls our webhook: POST /api/v1/payments/webhook (Stripe-Signature header validated)
6. IPaymentWebhookService processes event, updates Payment + PaymentTransactionLog
```

### PayPal flow

Same pattern as Stripe — creates PayPal order, redirects user, processes webhook at `POST /api/v1/payments/webhook/paypal`.

### Security: Webhook validation

Stripe webhooks are validated using `Stripe-Signature` header and the `Stripe__WebhookSecret`. Requests with invalid signatures are rejected with `400`. PayPal webhooks are similarly validated.

### Database records

- `Payments` — one row per payment, stores `ExternalReference` (Stripe session ID, PayPal order ID, or "LAB-..." for lab)
- `PaymentTransactionLogs` — timestamped event log for each payment

---

## Feature 4: Data Export / Import (≥ 5 lists, JSON + CSV + Excel)

**Requirement met:** Export/import for 5 lists, CSV, Excel, JSON.

### Backend export (per service)

Every major resource has an export endpoint. They all use `TravelAssistant.Common/Export/TabularExport.cs`:

```csharp
// TabularExport.cs
public static byte[] ToCsv(string[] headers, IEnumerable<string[]> rows)
public static byte[] ToXlsx(string sheetName, string[] headers, IEnumerable<string[]> rows)
public static byte[] ToJsonUtf8<T>(IEnumerable<T> items)
```

**5 export endpoints:**

| Resource | Route | Admin |
|----------|-------|-------|
| Users | `GET /api/v1/users/export?format=json\|csv\|xlsx` | ✓ |
| Bookings | `GET /api/v1/bookings/export?format=json\|csv\|xlsx` | ✓ |
| Payments | `GET /api/v1/payments/export?format=json\|csv\|xlsx` | ✓ |
| Itineraries | `GET /api/v1/itineraries/export?format=json\|csv\|xlsx` | ✓ |
| Notifications | `GET /api/v1/notifications/export?format=json\|csv\|xlsx` | ✓ |

### Backend import (per service)

Each resource also has an import endpoint:

```
POST /api/v1/{resource}/import
Body: JSON array of row objects
Auth: Admin JWT required
```

Import validation: all rows are validated first. If **any** row fails, the entire import is rejected with a list of errors and row numbers. This prevents partial imports.

### Frontend — AdminDataExchangePage

`/admin/data` is a tabbed page with one tab per resource. Each tab shows `AdminDataExchangeBar`:

1. **Export buttons** — clicking "JSON", "CSV", or "XLSX" calls `downloadResourceExport(token, resource, format)` → fetches the file from the API → triggers browser download
2. **Import button** — "Import JSON" opens a file picker; the selected `.json` file is parsed with `parseImportJsonFile(file)` → sends to `importResourceRows(token, resource, rows)` → shows success/error toast
3. **Sample file** — the `?` button downloads a sample JSON showing the correct structure for that resource

Inline `AdminDataExchangeBar` bars (compact mode) also appear at the top of:
- `AdminUsersPage`
- `AdminBookingsPage`
- `AdminTripsPage`

### Excel generation

Uses **ClosedXML** library (`ClosedXML.Excel` NuGet package). Creates a workbook with a styled header row and data rows. Cell values are strings — no formula injection possible.

---

## Feature 5: Real-Time Communication (SignalR)

**Requirement met:** Live notifications (no polling), chat with live delivery.

### How SignalR works in this project

SignalR maintains a persistent WebSocket connection between the browser and the server. When the server has something to send, it pushes it over that connection — no polling required.

### Notification hub

**Server:** `NotificationsHub` in `RealTimeCommunicationService`
- Path: `/hubs/notifications`
- Event name: `travelUpdate`
- Only authenticated users can connect (JWT via `?access_token=` query param)

**Frontend connection** (`realtimeNotificationsHub.js`):

```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`/hubs/notifications?access_token=${token}`)
  .withAutomaticReconnect([0, 2000, 5000, 10000])
  .build();

connection.on("travelUpdate", (payload) => {
  onTravelUpdate(payload);  // called by NotificationsContext
});

await connection.start();
```

**How a notification reaches the user:**

```
1. PaymentService: ITravelUpdatePublisher.NotifyUserAsync(userId, "Payment confirmed")
2. HttpTravelUpdatePublisher: POST /api/v1/notifications/internal/publish
3. NotificationService: persists notification + IRealtimeNotificationService.SendToUserAsync()
4. IHubContext<NotificationsHub>.Clients.User(userId.ToString()).SendAsync("travelUpdate", payload)
5. SignalR: pushes over WebSocket to that specific user's browser tab
6. NotificationsContext.onTravelUpdate: adds to notification list, shows toast, updates badge
7. AdminLayout (via useAdminRealtimeRefresh): if admin, re-hydrates all admin stores
```

### Chat hub

**Server:** `ChatHub` in `RealTimeCommunicationService`
- Path: `/hubs/chat`
- Event name: `chatMessage`

**How a chat message flows:**

```
1. User types in AiAssistantPage, sends form
2. POST /api/v1/chat { message: "..." }
3. ChatController: saves user message, generates AI reply text, saves AI reply
4. IHubContext<ChatHub>.Clients.User(userId).SendAsync("chatMessage", { role: "assistant", text })
5. Browser receives chatMessage event on chat hub connection
6. AiAssistantPage renders new message without any refresh
```

### Admin live dashboard

`useAdminRealtimeRefresh` hook (runs inside `AdminLayout`):
```javascript
subscribeTravelUpdate(async () => {
  // Called every time any travelUpdate event arrives
  const token = await ensureAccessToken();
  await Promise.all([
    useAdminBookingsStore.getState().hydrateFromApi(token),
    useAdminTripsStore.getState().hydrateFromApi(token),
    useAdminUsersStore.getState().hydrateFromApi(token),
    useAdminNotificationsStore.getState().hydrateFromApi(token),
  ]);
});
```

When any user makes a payment, the admin dashboard updates automatically.

---

## Core requirement: Authentication & Authorization

**Requirement met:** JWT with access + refresh tokens, BCrypt, role-based endpoints.

### Registration flow

```
POST /api/v1/auth/register
{ name, surname, email, password }

1. FluentValidation validates the request
2. Check email uniqueness (GetByEmailAsync)
3. BCrypt.HashPassword(password)  ← never stored as plain text
4. User saved to DB with PasswordHash
5. JWT access token generated:
   - Algorithm: HS256
   - Claims: sub (userId), email, given_name, family_name, role[]
   - Expiry: Jwt__AccessTokenMinutes (default: 30 min)
6. Refresh token generated:
   - Random bytes: Convert.ToBase64String(Guid.NewGuid().ToByteArray())
   - Stored as BCrypt hash in RefreshTokens table
   - Expiry: Jwt__RefreshTokenDays (default: 7 days)
7. Returns { accessToken, refreshToken, expiresAtUtc }
```

### Token refresh flow

```
POST /api/v1/auth/refresh { refreshToken }

1. Load all active refresh tokens for the user
2. BCrypt.Verify(incoming token, stored hash) for each
3. If match found and not expired/revoked:
   a. Mark old refresh token as RevokedAt = UtcNow
   b. Issue new refresh token (same BCrypt hash approach)
   c. Issue new access token
4. Return { accessToken, refreshToken, expiresAtUtc }
```

### Frontend token management (`authStore.js`)

- Access token stored in Zustand (persisted to localStorage)
- `ensureAccessToken()` is called before every API request that needs auth
- If token expires in < 60 seconds, proactively calls `/api/v1/auth/refresh`
- After refresh, all subsequent requests get the new token

### Role-based authorization

Three roles exist: `Admin`, `Support`, `User`.

```csharp
[Authorize]                          // any authenticated user
[Authorize(Roles = "Admin")]         // admin only
[Authorize(Roles = "Admin,Support")] // admin or support
[AllowAnonymous]                     // public
```

Role is included in the JWT claims, so every service can check it independently without calling UserService.

---

## Core requirement: Input Validation

**Requirement met:** FluentValidation + Data Annotations + EF parameterized queries.

### Server-side validation

- `FluentValidation.AspNetCore` with `AddFluentValidationAutoValidation()` is registered in services that have complex validation (UserService, BookingService, ItineraryService, PaymentService)
- Validators: `RegisterRequestValidator`, `CreateBookingRequestValidator`, `UpdateBookingStatusRequestValidator`, `GenerateItineraryRequestValidator`, `CreateCheckoutSessionRequestValidator`
- `[Required]`, `[EmailAddress]` data annotations on request DTOs as a second validation layer

### SQL injection protection

All database access uses **EF Core LINQ** — queries are compiled to parameterized SQL. No raw string concatenation in queries. The two uses of `ExecuteSqlRawAsync` in `Lab2DbSchemaBootstrap.cs` are for DDL statements (schema creation), not user input.

---

## Core requirement: CORS

Configured on the API Gateway (`server/ApiGateway/Program.cs`) and separately on NotificationService (for SignalR WebSocket upgrade):

```csharp
policy.WithOrigins(origins)   // from Cors__AllowedOrigins__* env vars
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();    // required for SignalR cookies/credentials
```

`AllowCredentials()` is required for SignalR to send cookies/auth headers during the WebSocket handshake.

---

## Dynamic Report Generation (bonus feature)

### Server-side

`AdminReportsController` in BookingService:
```
GET /api/v1/reports/bookings?from=2026-01-01&to=2026-12-31&status=Confirmed&format=csv
```

Filters by date range and status, returns the result as JSON, CSV, or XLSX.

### Client-side

`AdminReportsPage` → `AdminReportsBuilder`:
1. User selects report type (bookings / users / trips)
2. User selects date range and status filter
3. `buildReportRows(type, data, criteria)` filters from the local admin stores
4. Results shown in a preview table
5. **Export CSV** — `downloadCsv(filename, rows)` triggers download
6. **Print** — `openPrintReport(title, rows, criteria)` opens a formatted HTML report in a new browser tab

---

## Security headers

Every response from every service includes security headers (applied by `SecurityHeadersMiddleware`):

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer info |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables unused browser APIs |
