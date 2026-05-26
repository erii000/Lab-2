# Presentation Guide — Professor Q&A Preparation

This guide covers every question a professor might ask during the presentation. Each answer is direct and honest about how the code works.

---

## Architecture questions

### "What architecture pattern did you use?"

We used **Microservices Architecture with an API Gateway**. The backend is split into 9 independent services. Each service is a separate .NET 9 Web API with its own Dockerfile, its own database context, and its own responsibility.

The frontend is a React SPA that communicates only with the API Gateway. The gateway routes each request to the correct service using YARP (a Microsoft reverse proxy library).

We also applied the **3-layer (layered) architecture** inside each service: Controller → Service → Repository. Controllers handle HTTP, services hold all business logic, repositories handle all database access.

### "Why did you choose microservices?"

- It satisfies the course requirement (additional feature #6)
- Each team member could own a service independently
- Services can be scaled, deployed, and updated independently
- Failure in one service (e.g. WeatherService) does not crash the others

### "How do services communicate with each other?"

Services communicate asynchronously through two HTTP interfaces in the shared `TravelAssistant.Common` library:

1. `HttpAuditWriter` — any service can write an audit log by HTTP-posting to AuditService with a shared secret key (`X-Audit-Key` header), no JWT needed
2. `HttpTravelUpdatePublisher` — any service can send a real-time notification by HTTP-posting to NotificationService with a shared secret (`X-Notification-Key`)

Both calls are fire-and-forget: if the target service is down, the calling service logs the error but continues normally — business flow is not disrupted.

### "How does the API Gateway know where to route requests?"

The routing config is in `server/ApiGateway/appsettings.json` under `ReverseProxy.Routes`. Each route has a path pattern and a cluster name. Clusters map to backend service URLs. No code is needed — only JSON config is changed to add a new route.

---

## Security questions

### "How are passwords stored?"

Passwords are **never stored as plain text**. We use **BCrypt** (`BCrypt.Net` library). When a user registers:

```csharp
user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
```

BCrypt generates a random salt, computes the hash, and stores both together in the hash string. To verify a login:

```csharp
bool valid = BCrypt.Net.BCrypt.Verify(inputPassword, user.PasswordHash);
```

Even if the database is stolen, passwords cannot be reversed.

### "How does JWT authentication work?"

1. When a user logs in, `AuthService` creates a **JWT access token** containing claims: user ID, email, name, roles. It is signed with a secret key using HS256. Expiry: 30 minutes.
2. A **refresh token** (opaque random bytes) is also created. Its BCrypt hash is stored in the `RefreshTokens` database table with an expiry of 7 days.
3. The client stores both tokens. Before any authenticated request, it sends `Authorization: Bearer <accessToken>`.
4. Each service independently validates the JWT (same secret key, no call to UserService needed).
5. When the access token expires, the frontend calls `POST /api/v1/auth/refresh` with the refresh token. A new pair is issued, old refresh token is revoked.

### "What happens if someone steals the refresh token?"

The refresh token itself is never stored in the database — only its BCrypt hash is. This means even if someone reads the `RefreshTokens` table, they cannot use the token value directly (they'd need to brute-force BCrypt, which is computationally expensive).

When a user logs out, the refresh token is marked `RevokedAt = UtcNow`. Any attempt to use a revoked token returns 401.

### "How do you protect against SQL injection?"

All database queries use **Entity Framework Core LINQ**, which always generates parameterized SQL. No string concatenation in queries. Example:

```csharp
// EF generates: SELECT * FROM Users WHERE Email = @p0
var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
```

The only raw SQL in the project is in `Lab2DbSchemaBootstrap.cs` for DDL statements (CREATE TABLE) — no user input is ever interpolated there.

### "How is CORS configured?"

CORS is configured on the API Gateway. The allowed origins are read from environment variables (`Cors__AllowedOrigins__0..3`) so they can be changed without code changes. In development: `localhost:5173`. The `AllowCredentials()` option is needed for SignalR WebSocket connections.

### "How do you validate input?"

Two layers:
1. **FluentValidation** — registered in services that have complex rules (`AddFluentValidationAutoValidation()`). Validators run automatically before the controller action. Example: `RegisterRequestValidator` checks email format, password minimum length.
2. **Data annotations** on DTOs (`[Required]`, `[EmailAddress]`) as a fallback.

---

## Real-time questions

### "How does real-time communication work?"

We use **ASP.NET Core SignalR** which uses WebSockets under the hood (with fallback to Server-Sent Events).

Two SignalR hubs are hosted in `RealTimeCommunicationService`:
- `NotificationsHub` at `/hubs/notifications` — pushes `travelUpdate` events
- `ChatHub` at `/hubs/chat` — pushes `chatMessage` events

The browser connects to these hubs via the API Gateway (which has `UseWebSockets()` enabled). JWT is passed as a query parameter (`?access_token=...`) because WebSocket headers can't be set from JavaScript.

### "Show me the notification flow end-to-end"

1. User completes a payment → `PaymentService` calls `ITravelUpdatePublisher.NotifyUserAsync(userId, "Payment confirmed")`
2. `HttpTravelUpdatePublisher` posts to `NotificationService`'s internal endpoint with `X-Notification-Key`
3. `NotificationService` persists the notification to the `Notifications` DB table
4. `IRealtimeNotificationService` calls `IHubContext<NotificationsHub>.Clients.User(userId).SendAsync("travelUpdate", payload)`
5. SignalR pushes the event over WebSocket to that specific user's browser
6. `NotificationsContext` in React receives it, shows a toast notification, increments the bell badge
7. If the user is an admin, `useAdminRealtimeRefresh` also refreshes all admin stores (bookings, users, trips, notifications)

### "Is this real-time or is it polling?"

It is real-time — no `setInterval` or polling is used for notifications. The connection is a persistent WebSocket. The server pushes data to the client. The only `setInterval` in the code is for a typing animation in the AI assistant UI (cosmetic only).

---

## Payment questions

### "How does payment work?"

The system supports three providers: Stripe, PayPal, and a "Lab" fallback.

For the demo (Lab provider):
1. User fills in the payment form (`SecureCheckoutForm`)
2. Client-side Luhn check validates the card number format
3. `POST /api/v1/payments/checkout` is called
4. `LabPaymentCheckoutService` creates a `Payment` record with status `Completed`
5. Also logs to `PaymentTransactionLogs`, sends notification, writes audit log
6. Returns `{ paymentId, status: "Completed" }`
7. Frontend calls `POST /api/v1/bookings/:id/confirm-payment` to update booking status

For Stripe: a hosted Checkout Session is created, the user is redirected to Stripe's page, and our webhook (`POST /api/v1/payments/webhook`) receives the event and updates our database.

### "Why are Stripe webhook endpoints public (AllowAnonymous)?"

Because Stripe/PayPal call our webhook from their servers — they cannot include our JWT. Instead, we validate the request using a signature: Stripe sends a `Stripe-Signature` header computed using our `Stripe__WebhookSecret`. We verify this signature in `IPaymentWebhookService`. If it doesn't match, we reject with 400.

---

## Database questions

### "How does the database connect?"

The connection string is in `server/global-settings.env` (this file is gitignored — secrets are never in Git). All services read the same environment variable `ConnectionStrings__DefaultConnection`. In Docker, it's injected as an environment variable from that file.

### "Do all services share one database?"

Yes — one physical SQL Server database (`lab2DB`), but each service only touches its own tables. There's one EF `ApplicationDbContext` per service, each with only its own `DbSet<>` properties.

### "How are migrations managed?"

EF Core code-first migrations, one per service. Each service has a `Migrations/` folder. Run `dotnet ef database update` per service. The `__EFMigrationsHistory` table in SQL Server tracks what has been applied.

### "Why don't you have foreign key constraints across services?"

In microservices, cross-service FK constraints create tight coupling — you can't independently deploy, scale, or migrate services if their schemas have DB-enforced dependencies. We maintain **logical** foreign keys (developers know `Bookings.UserId` refers to a user) but enforce consistency through application code, not DB constraints.

---

## Export / Import questions

### "How does export work technically?"

The controller calls the repository to get data, then passes it to `TabularExport` from `TravelAssistant.Common`:

```csharp
case "csv":
    return File(
        TabularExport.ToCsv(headers, rows),
        "text/csv",
        $"users-{DateTime.UtcNow:yyyyMMdd}.csv"
    );
```

`TabularExport.ToCsv` generates a UTF-8 BOM CSV with proper RFC 4180 escaping (commas and double-quotes in cells are handled correctly). `ToXlsx` uses the **ClosedXML** library to create a real Excel workbook.

### "How does import work?"

Import accepts a JSON array in the request body. Validation runs on all rows first. If any row fails, the entire import is rejected with a list of errors and row numbers — no partial imports. Only if all rows are valid does the service persist them.

### "Which lists support export/import?"

Users, Bookings, Payments, Itineraries, Notifications — all 5 as required.

In the UI: go to **Admin → Data exchange** for all 5 in one place, or use the export/import bar on the Users, Bookings, or Trips pages.

---

## Frontend questions

### "How is state managed?"

We use **Zustand** — a lightweight state management library. All stores are persisted to `localStorage` so state survives page refresh.

Key stores:
- `authStore` — session (user info + tokens)
- `bookingStore` — user's bookings
- `plannerStore` — current trip being planned
- `adminBookingsStore`, `adminUsersStore`, `adminTripsStore` — admin data

### "How does the frontend handle token expiry?"

`authStore.ensureAccessToken()` is called before every API request. It checks if the access token expires within 60 seconds. If so, it proactively calls `POST /api/v1/auth/refresh` and updates the stored tokens. This means users never see an unexpected 401 error mid-session.

### "What is the Vite proxy?"

In development, Vite is configured to proxy `/api` and `/hubs` requests to `http://localhost:5161` (the API Gateway). This means the frontend always calls the same origin (`:5173`), avoiding CORS issues in development. In production, the frontend and gateway are behind the same domain.

### "How does the advanced search work on the frontend?"

`applyAdvancedListQuery()` in `advancedSearch.js`:
1. Filter by predicate (e.g. status chip)
2. Full-text filter: normalize input (lowercase, strip diacritics), split into tokens, check every token appears in the item's searchable text
3. Sort by the selected sort key with type-aware comparison (string, number, or date)

All of this runs client-side on the already-loaded list — no new API call is needed when the user types in the search box.

---

## Docker questions

### "How do you start the application?"

```bash
# Backend (all services):
cd server
docker compose up --build

# Frontend (dev mode):
cd client
npm ci
npm run dev
```

### "What does Docker Compose do?"

It starts all 9 services + gateway in containers with the correct environment variables and networking. Services communicate via Docker internal DNS (`http://userservice:8080/`). The gateway is the only container with an exposed public port (5161).

### "Why are there local and Docker port numbers?"

Services have two launchSettings profiles:
- **Local** (without Docker): runs on a fixed port (e.g. UserService on 62381) — these are referenced in the gateway's local `appsettings.json`
- **Docker**: all containers run on port 8080 internally; Docker maps them to the correct external ports

---

## Team / Git questions

### "How did you divide the work?"

Per the `server/TEAM_BACKLOG_SPLIT.md` (imported into the project board):
- Member A — Gateway, UserService, JWT auth, CORS, README
- Member B — ItineraryService, Destinations, DB ERD, travel preferences
- Member C — BookingService, PaymentService, Docker, export/import

Each member has individual commits visible in `git log`.

### "Where is your project board?"

GitHub Projects (linked from the repository). Columns: To Do, In Progress, Done. Each card has an assignee and a deadline per `docs/PROJECT_MANAGEMENT.md`.

---

## Demo script (recommended order)

1. **Run** — `docker compose up` + `npm run dev`
2. **Register** a new user account
3. **Search** a destination on `/explore` — demonstrate full-text search with filters
4. **Open** a destination detail page — show AI summary, trip pricing, curated departures
5. **Generate** an itinerary (AI planner)
6. **Book** the trip — show the booking flow
7. **Pay** — use the lab checkout (no real card needed in demo mode)
8. **Show notification** — bell badge updates live, no page refresh (real-time)
9. **Admin** — login as `admin@smarttravel.app` / `admin12345`
10. **Admin Dashboard** — show KPIs, chart, smart insights
11. **Admin Bookings** — show search, sort, status update
12. **Admin Data exchange** — export users as CSV/Excel, show file download; import sample JSON
13. **Admin Reports** — generate a custom booking report, export CSV, print
14. **Postman** — show `GET /api/v1/bookings/export?format=xlsx` and `GET /api/v1/notifications/search`
15. **Swagger** — open `http://localhost:62381/swagger` to show API documentation
