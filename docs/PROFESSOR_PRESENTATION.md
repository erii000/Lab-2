# Smart Travel Assistant — Professor Presentation Guide

This document explains **in plain language** how the project satisfies course requirements (sections 3–7) and the **100% presentation rubric**. Use it to answer questions during the demo — no code required.

---

## 3. Application Architecture

### 3.1 Layered separation (Controller → Service → Repository)

We use a **microservices** backend: nine independent .NET services behind one **API Gateway**. Inside **each** service, the same three layers are applied consistently.

**Controllers (HTTP layer)**  
- Receive HTTP requests, validate input shape, call the service layer, and return JSON responses.  
- They do **not** contain business rules (no “if booking is paid then…” logic).  
- Example: `BookingsController` accepts `POST /api/v1/bookings` and delegates to `BookingWorkflowService`.

**Services (business layer)**  
- Contain all application rules: booking status transitions, payment checkout, notification text, chat flows, itinerary generation rules, etc.  
- Orchestrate multiple steps (save to DB, call audit service, push real-time notification).  
- Example: when a payment is confirmed, `BookingWorkflowService` updates the booking, notifies the traveler, and broadcasts to admins.

**Repositories (data layer)**  
- Talk to storage only — **Entity Framework Core** for SQL, **MongoDB.Driver** for audit/event documents, **Redis** for cache reads/writes.  
- Services never write raw SQL with user input; repositories expose methods like `GetByIdAsync`, `SearchAsync`, `AddAsync`.  
- This isolates persistence from business logic and lets each service pick the right store (SQL vs document vs cache).

**API Gateway (separate concern)**  
- The gateway is **not** a fourth business layer. It is a **reverse proxy (YARP)** that routes `/api/v1/bookings` to BookingService, `/api/v1/auth/login` to UserService, etc.  
- It has almost no files on purpose — routing is defined in configuration, not in business code.

**How to say it in one sentence:**  
*“Every microservice follows Controller → Service → Repository; the gateway only forwards traffic.”*

---

### 3.2 Security

#### Authentication & authorization (JWT + refresh + roles)

**Registration and login**  
- User registers with email and password. Password is hashed (see below).  
- On login, **UserService** issues two tokens:  
  - **Access token (JWT)** — short-lived (~30 minutes), sent on every API call in the `Authorization: Bearer` header.  
  - **Refresh token** — longer-lived (~7 days), used only to obtain a new access token when the old one expires.  
- The JWT contains claims: user id, email, name, and **roles** (e.g. `Admin`, `Traveler`).

**How protected endpoints work**  
- Each microservice validates the JWT independently (same secret key configured via environment variables).  
- Endpoints marked as protected reject requests without a valid token (401).  
- **Role-based access control:** admin-only APIs use role checks (e.g. only `Admin` can list all users, export data, or reply in support chat). Travelers can only access their own bookings and notifications.

**Admin vs traveler on the frontend**  
- After login, the app calls “who am I?” and reads roles from the database.  
- If the user has the Admin role → redirect to `/admin` and show the admin dashboard.  
- Otherwise → traveler home, booking flows, live chat, notification bell.  
- The admin layout blocks non-admins even if they manually type `/admin` in the URL.

**Refresh and logout**  
- When the access token expires, the frontend calls the refresh endpoint with the refresh token and receives a new pair.  
- On logout, the refresh token is revoked in the database so it cannot be reused.

#### Password hashing

- Passwords are **never** stored as plain text.  
- **BCrypt** is used: on register, the password is hashed with a random salt; on login, the submitted password is verified against the hash.  
- Refresh tokens are also stored as hashes in the database, not as raw values.

#### Input validation (including SQL injection protection)

**Two layers:**  
1. **FluentValidation** — rules on request DTOs (email format, password length, required fields) run automatically before the controller action.  
2. **Data annotations** on models as a fallback.

**SQL injection**  
- All application queries use **Entity Framework Core** (LINQ), which generates **parameterized SQL**. User input is never concatenated into query strings.  
- The only raw SQL in the project is fixed schema bootstrap scripts (CREATE TABLE) with no user input.

#### CORS

- CORS is configured on the **API Gateway** (and on services that host SignalR).  
- Only **authorized origins** are allowed (e.g. `http://localhost:5173`, `http://localhost:5174` for Vite dev).  
- Credentials are allowed so WebSocket (SignalR) connections work from the SPA.

#### Environment variables and secrets

- Secrets and connection strings live in **`server/global-settings.env`** (copied from `global-settings.env.example`).  
- This file is **gitignored** — never committed.  
- Includes: database connection string, JWT secret, internal keys for audit/notification services, optional Stripe/PayPal keys.  
- Docker Compose loads the same file for all containers.

---

## 4. Version Control (Git)

**Repository:** GitHub — organized with `client/`, `server/`, `docs/`, `TravelAssistant.Common/`, solution file, Docker Compose.

**Individual commits**  
- Each team member commits on their own account with meaningful messages (feature/fix area + short why).  
- Work is integrated via branches and pull requests where possible so history shows who did what.

**Commit messages**  
- Describe intent, not only files: e.g. “Add admin live chat messages page”, “Fix JWT role claims for admin export”, “Bootstrap ChatMessages schema for RTC service”.

**Course requirement — invite reviewer**  
- Add **elton.boshnjaku@ubt-uni.net** as a collaborator on the GitHub repository (Settings → Collaborators).

**What to show the professor**  
- GitHub commit graph per author.  
- Example PR or merge commits linking to features (auth, payments, real-time, admin).

---

## 5. Project Management Tool

**Allowed tools:** Jira, Trello, or **GitHub Projects** (recommended — same repo).

**Board columns (mandatory):**  
- **To Do**  
- **In Progress**  
- **Done**

**Task rules**  
- Every task has an **assignee** (team member) and a **deadline**.  
- Tasks are derived from `server/TEAM_BACKLOG_SPLIT.md` (sprint cards by service: UserService, BookingService, gateway, frontend, etc.).

**Suggested ownership (example)**  
| Member | Focus |
|--------|--------|
| A | Auth, gateway, CORS, users, documentation |
| B | Itineraries, destinations, database ERD |
| C | Bookings, payments, Docker, export/import |
| D | Notifications, real-time, admin UI, chat |

**What to show the professor**  
- Open the board: cards in To Do / In Progress / Done with names and dates.  
- Link cards to commits or PRs where possible.

---

## 6. Documentation

| Requirement | Where it lives | What it contains |
|-------------|----------------|------------------|
| **README.md** | Root `README.md`, `server/README.md`, `client/README.md` | Prerequisites, `global-settings.env` setup, Docker `compose up`, frontend `npm run dev`, smoke test script, demo admin credentials |
| **API documentation** | Swagger UI per service (Development), `docs/postman/TravelAssistant.postman_collection.json`, `docs/BACKEND.md` | All major endpoints: auth, users, bookings, payments, notifications, chat, audit, support, weather |
| **Database ERD** | `docs/DATABASE-ERD.md`, `docs/DATABASE.md` | Mermaid ERD, table list per service, relationships, indexes, bootstrap script reference |

**How to demo API docs**  
- Swagger on a running service (e.g. UserService port) or Postman collection: login → get bookings → export users as CSV.

**How to demo ERD**  
- Open `docs/DATABASE-ERD.md`: show Users → Bookings → Payments, Users → Roles via UserRoles, Notifications, ChatMessages, etc.

---

## 7. Real-Time Communication (mandatory)

We implement **both** options using **ASP.NET Core SignalR** (WebSockets under the hood, with automatic reconnect). **No polling** is used for notifications or chat.

### 7.1 Live notifications (traveler + admin)

**What the user sees**  
- Traveler: bell icon on the homepage; badge count; toast when something happens (payment confirmed, support reply).  
- Admin: separate notification feed (ops events: new booking, live chat message, refunds).

**How it works (conceptually)**  
1. Something happens in a service (e.g. payment completed, support message sent).  
2. That service calls the **Notification Service** over HTTP (internal publish API with a shared secret).  
3. Notification Service **saves** the notification and **pushes** it over SignalR on `/hubs/notifications`.  
4. The browser keeps a **persistent WebSocket** connection; the event arrives instantly.  
5. The React app updates the list and badge without refreshing the page.

**Admin dashboard live updates**  
- When an admin is logged in, the same SignalR feed triggers a **refresh of admin data** (bookings, trips, users) so KPIs and lists stay current when a traveler pays or books.

### 7.2 Live chat (traveler ↔ admin)

**What the user sees**  
- Traveler on **Contact → Live chat**: types a message; sees “Connected · live”; receives admin replies immediately.  
- Admin on **Messages** (or from a support notification): sees conversation list, opens thread, replies; traveler sees the reply in real time.

**How it works**  
1. Traveler sends message via REST API; message is stored.  
2. **Real-Time Communication Service** pushes the message to admin agents (SignalR group) and notifies admins via the notification hub.  
3. Admin reply is stored and pushed to the traveler’s user channel on `/hubs/chat`.  
4. Both sides use WebSocket connections — not interval polling.

**What to demo in 2 minutes**  
1. Two browsers: traveler on `/contact`, admin on `/admin/messages`.  
2. Traveler sends “Hello”.  
3. Admin sees notification + thread; replies.  
4. Traveler sees reply without refresh.

---

## How each major feature works (plain language)

This section explains **what happens behind the scenes** when a user interacts with the app. Use it when the professor asks “how does X actually work?”

### Authentication and sessions

1. User submits email + password on the login page.  
2. **UserService** looks up the user in SQL, verifies the password with **BCrypt** (compare hash, never decrypt).  
3. If valid, the service creates a **JWT access token** (short life) and a **refresh token** (longer life, stored as a hash in SQL).  
4. The React app saves tokens in **Zustand** (`authStore`) and attaches the JWT to every API call.  
5. When the JWT expires, the app silently calls `/api/v1/auth/refresh` with the refresh token — no forced logout.  
6. **Admin vs traveler:** the same login flow reads roles from `UserRoles`; the frontend routes admins to `/admin`, everyone else to the traveler home.

**One-liner:** *Login issues JWT + refresh; every service validates the JWT; roles decide admin vs traveler.*

### Booking flow

1. Traveler picks a destination on **Explore** or **Home** (catalog comes from ItineraryService; Redis caches the list for speed).  
2. **Booking page** collects dates, travelers, options — stored in `bookingStore` (Zustand) across steps.  
3. On confirm, **BookingService** creates a `Bookings` row in SQL with status `Pending` or `AwaitingPayment`.  
4. BookingService may call **AuditService** (HTTP + internal key) to log “BookingCreated”.  
5. **NotificationService** publishes a travel update → SignalR pushes to the traveler bell and refreshes admin KPIs.

**One-liner:** *Multi-step UI state in Zustand → one API call creates the SQL booking → audit + real-time notify.*

### Payments (Stripe / PayPal / lab demo)

1. Traveler clicks pay; **PaymentService** creates a checkout session with the provider (or lab mock).  
2. The **payment record** (amount, status, user, booking link) is stored in SQL `Payments` — this is the financial source of truth.  
3. When Stripe/PayPal sends a **webhook** (payment succeeded, refund, etc.), PaymentService:  
   - Checks **MongoDB** `payment_transaction_logs` for duplicate `ExternalEventId` (idempotency — same webhook never processed twice).  
   - Appends the raw event payload as a **document** in Mongo (flexible schema for provider-specific JSON).  
   - Updates the SQL `Payments` row and triggers booking confirmation + notifications.  
4. Admin can search/export payments from SQL; forensic webhook history lives in Mongo.

**One-liner:** *SQL holds payment state; Mongo holds append-only webhook/event logs with deduplication.*

### Advanced search (admin and APIs)

1. Admin opens Users, Bookings, or Trips and types in the search box or applies filters.  
2. The frontend sends query params (`q`, date range, status, sort) to the gateway.  
3. Each **service repository** builds a **parameterized** LINQ query (SQL) — no string concatenation.  
4. Results return as a **paged** JSON list; the admin table re-renders from Zustand store.  
5. Five+ resources support this pattern: users, bookings, payments, itineraries, notifications, audit logs.

**One-liner:** *Filters go to the server; repositories run safe parameterized queries; UI shows pages of results.*

### Data export and import

1. Admin opens **Data Exchange**, picks a resource (users, bookings, payments, itineraries, notifications).  
2. **Export:** the service loads rows (with the same search filters), converts to **JSON, CSV, or Excel** (`TravelAssistant.Common` tabular helpers), and downloads a file.  
3. **Import:** admin uploads JSON; the controller validates shape (FluentValidation), then inserts/updates rows in SQL with error reporting per row.  
4. Audit entries for bulk import/export go to **MongoDB** via AuditService.

**One-liner:** *Admin picks format → service serializes SQL data out or validates JSON in.*

### Live notifications

1. An event occurs (payment done, booking created, support message).  
2. The originating service calls NotificationService’s **internal publish API** (shared secret, not public).  
3. NotificationService **writes** a `Notifications` row in SQL and **pushes** over SignalR (`/hubs/notifications`).  
4. The React **NotificationsProvider** (traveler) or **AdminNotificationsProvider** (admin) receives `travelUpdate`, updates Zustand, shows toast + badge.  
5. Admin dashboard hooks the same event to **refresh** bookings/users lists.

**One-liner:** *HTTP publish → SQL persist → SignalR push → React store updates instantly.*

### Live chat (traveler ↔ admin)

1. Traveler types on **Contact → Live chat**; message goes to **RealTimeCommunicationService** REST API and is stored in SQL `ChatMessages`.  
2. RTC pushes to SignalR group `support-agents` so all connected admins see it.  
3. NotificationService also sends an admin **ops notification** with `chatUserId` so clicking it opens `/admin/messages?user={id}`.  
4. Admin reply uses `POST /api/v1/chat/user/{id}/reply`; RTC pushes to the traveler’s user channel on `/hubs/chat`.  
5. Both sides keep a **WebSocket** connection — no polling timer.

**One-liner:** *REST saves message → SignalR delivers to the other side in real time.*

### Weather and external data

1. App calls `/api/v1/weather/current?city=Paris` through the gateway.  
2. **WeatherExternalDataService** checks **Redis** first (`weather:current:paris:fr`).  
3. On cache miss, it calls **Open-Meteo** (geocode + forecast), stores the DTO in Redis (15–30 min TTL), returns JSON.  
4. Second request for the same city is served from Redis — faster and fewer external API calls.

**One-liner:** *Redis cache in front of Open-Meteo; TTL keeps data fresh enough for travel UI.*

### AI-assisted travel (bonus)

1. **Itinerary planner** sends preferences to ItineraryService; planning rules build day-by-day activities (catalog + templates).  
2. **Explore AI chat** sends user messages to a client-side or API-assisted flow for destination suggestions.  
3. **Vision upload** on explore sends an image for analysis (destination hints).  
4. AI features sit **on top of** the same catalog and booking data — they do not replace SQL persistence.

**One-liner:** *AI suggests and plans; bookings and itineraries still persist in SQL.*

### Microservices + Docker

1. `docker compose up --build` starts **mongo**, **redis**, nine .NET services, API gateway, and the React client.  
2. Browser talks only to **gateway :5161** (and Vite :5174 in dev); gateway routes by path prefix to the correct service.  
3. Each service has its own Dockerfile, health check, and Swagger in Development.  
4. Shared config: `server/global-settings.env` (JWT, SQL, Mongo, Redis, internal keys).

**One-liner:** *One front door (gateway); each domain owns its service and database tables.*

### NoSQL — MongoDB and Redis (implemented)

| Store | Where used | Why not SQL? |
|-------|------------|--------------|
| **MongoDB** `audit_logs` | AuditService — all audit read/write | Append-only events, flexible `Details` text, high write volume, easy indexing for admin search |
| **MongoDB** `payment_transaction_logs` | PaymentService webhooks | Raw provider JSON varies; unique index on `ExternalEventId` for idempotency |
| **Redis** | Weather API responses, destination catalog | Ephemeral cache; sub-millisecond reads; automatic expiry (TTL) |

**Prove it in the demo:**  
- `GET http://localhost:65486/api/ping` → `"storage": "mongodb"`  
- `GET http://localhost:63187/api/ping` → `"transactionLogs": "mongodb"`  
- `GET http://localhost:61219/api/ping` → `"cache": "redis"`  
- `GET http://localhost:63189/api/ping` → `"destinationCatalogCache": "redis"`

---

## Presentation rubric — how to explain each area (100%)

### 1. Management and documentation (10%)

| Area | Weight | How we meet it |
|------|--------|----------------|
| Git — individual commits, PRs | 5% | GitHub history per member; descriptive commits; PRs for features |
| Jira / Trello / GitHub Projects | 5% | Board with To Do / In Progress / Done, owners, deadlines (`docs/PROJECT_MANAGEMENT.md`) |

### 2. Database (20%)

| Area | Weight | How we meet it |
|------|--------|----------------|
| Relational design — schema, relationships, indexes, 3NF | 10% | Shared Azure SQL `lab2DB`; normalized tables (Users, Roles, Bookings, Payments, etc.); FK relationships; indexes on foreign keys and search fields; ERD in `docs/DATABASE-ERD.md`; bootstrap script `server/Scripts/lab2DB-memberb-bootstrap.sql` |
| NoSQL integration — implementation and justification | 10% | **Implemented polyglot persistence:** SQL Server for ACID core data (users, bookings, payment **records**). **MongoDB** stores `audit_logs` (AuditService) and `payment_transaction_logs` (PaymentService webhooks) via `MongoDB.Driver` repositories in `TravelAssistant.Common`. **Redis** caches weather API responses and the destination catalog via `StackExchange.Redis` and `IResponseCache`. Wired in `docker-compose.yml` with `MongoDb__ConnectionString` and `Redis__ConnectionString`. Documented in `docs/DATABASE-ERD.md`. **Justification:** SQL for transactions; Mongo for append-only flexible documents; Redis for fast ephemeral cache. |

### 3. Backend (20%)

| Area | Weight | How we meet it |
|------|--------|----------------|
| Architecture and layering | 5% | Nine microservices; each uses Controller → Service → Repository; shared `TravelAssistant.Common` for cross-cutting concerns |
| Business logic | 5% | Booking workflow, payment orchestration, notification routing, chat threads, itinerary search, refund rules — all in service classes |
| Authentication, authorization, security | 5% | JWT + refresh, BCrypt, roles, FluentValidation, EF parameterized queries, CORS, env-based secrets |
| Real-time communication | 5% | SignalR hubs `/hubs/notifications` and `/hubs/chat`; internal publish pipeline; admin support group |

### 4. Frontend (25%)

| Area | Weight | How we meet it |
|------|--------|----------------|
| Centralized state management | 5% | **Zustand** stores: `authStore`, `bookingStore`, `adminBookingsStore`, `adminUsersStore`, `adminNotificationsStore`, etc.; persisted session where needed |
| Interactivity — forms, filters, navigation | 5% | Multi-step booking, explore filters, admin advanced search/sort on users/bookings/trips, login/register, live chat, contact flows |
| Real-time — live UI, notifications | 5% | SignalR clients in `realtimeNotificationsHub.js` and `realtimeChatHub.js`; toasts; badge counts; admin Messages page |
| Optimization — lazy loading, performance | 5% | React `lazy()` for all major pages in `router.jsx`; Vite code splitting; API hydration only when needed (admin stores load after admin login) |

### 5. Additional features — minimum 3 (30%)

We implemented **more than three**. Explain any three (or all five) below — each row includes **how it works**, not only what exists:

| # | Feature | What to say (how it works) |
|---|---------|----------------------------|
| 1 | **Microservices + API Gateway + Docker** | Browser hits **one URL** (gateway :5161). YARP reads `appsettings.json` routes and forwards to the correct container (e.g. `/api/v1/bookings` → BookingService). `docker compose up --build` starts SQL-backed services plus **mongo** and **redis**. Each service is independently deployable with its own Dockerfile. |
| 2 | **Advanced search (5+ lists)** | Admin filters are sent as **query parameters** to the backend. Each service’s **repository** translates them into parameterized EF LINQ (safe from SQL injection) and returns **paged** results. Same pattern on users, bookings, payments, itineraries, notifications, and audit logs (Mongo for audit). |
| 3 | **Online payments** | Checkout creates a row in SQL `Payments`. Provider webhooks hit PaymentService; before processing, we check Mongo for duplicate `ExternalEventId`, then **append** the raw JSON event to `payment_transaction_logs`, then update SQL payment status and confirm the booking. Supports Stripe, PayPal, and lab demo mode. |
| 4 | **Data export / import (5 lists)** | Admin **Data Exchange** calls export endpoints that query SQL (with filters), then `TravelAssistant.Common` builds CSV/XLSX/JSON downloads. Import accepts JSON, runs FluentValidation, writes rows transactionally, and logs to audit (Mongo). Five resources: users, bookings, payments, itineraries, notifications. |
| 5 | **AI-assisted travel** (bonus) | ItineraryService builds day plans from catalog + user preferences; explore page offers AI chat and image-based destination hints. AI assists discovery; **persistence** remains in SQL itineraries/bookings. |

Each additional feature is **10%** in the rubric — pick the three you demo strongest.

---

## Suggested 15-minute demo flow

1. **Architecture** — diagram: browser → gateway → services → SQL + Mongo + Redis.  
2. **Security** — register/login; show JWT in Network tab; try admin URL as traveler (blocked).  
3. **Database** — flash ERD; SQL for core tables; ping Audit/Payment/Weather services to show Mongo/Redis.  
4. **Traveler flow** — explore → book → pay (lab) → notification bell (real-time).  
5. **Live chat** — traveler message → admin Messages → reply (real-time).  
6. **Admin** — dashboard KPIs, users search/filter, export CSV from Data exchange.  
7. **Docs** — README quick start; Postman or Swagger one endpoint.  
8. **Git / board** — commit authors; GitHub Projects columns.

---

## Quick Q&A cheat sheet

| Question | Short answer |
|----------|----------------|
| Why is the API Gateway so small? | It only proxies; business logic stays in microservices. |
| How do you separate admin and user? | `Roles` + `UserRoles` tables; JWT role claims; `[Authorize(Roles = "Admin")]`; frontend `session.role`. |
| SQL injection? | EF Core parameterized queries; FluentValidation on input. |
| Real-time without polling? | SignalR WebSockets; events `travelUpdate` and `chatMessage`. |
| Where are secrets? | `global-settings.env`, not in git. |
| Export/import? | Admin → Data exchange; five resources; JSON/CSV/XLSX. |
| NoSQL? | MongoDB: audit logs + payment webhook logs (`MongoAuditLogRepository`, `MongoPaymentTransactionLogStore`). Redis: weather + destination catalog cache (`RedisResponseCache`, `CachedWeatherClient`). See `/api/ping` on each service. |

---

## Files to open if the professor asks for proof

- Layering: `server/Services/BookingService/Controllers/`, `Services/`, `Repositories/`  
- Auth: `server/Services/UserService/Services/AuthService.cs`, `Data/ReferenceDataSeeder.cs`  
- Gateway routes: `server/ApiGateway/appsettings.json`  
- Real-time: `client/src/services/realtimeNotificationsHub.js`, `ContactLiveChat.jsx`, `AdminMessagesPage.jsx`  
- Docs: `README.md`, `docs/DATABASE-ERD.md`, `docs/postman/TravelAssistant.postman_collection.json`  
- NoSQL: `TravelAssistant.Common/Mongo/`, `TravelAssistant.Common/Caching/`, `MongoAuditLogRepository.cs`, `CachedWeatherClient.cs`  
- Project management: `docs/PROJECT_MANAGEMENT.md`, `server/TEAM_BACKLOG_SPLIT.md`
