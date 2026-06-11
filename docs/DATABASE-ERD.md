# Database ERD — lab2DB (Smart Travel Assistant)

Shared Azure SQL database `lab2DB` used by all microservices (table ownership per service).

```mermaid
erDiagram
    Users ||--o{ RefreshTokens : has
    Users ||--o{ UserRoles : has
    Roles ||--o{ UserRoles : assigns
    Users ||--o{ Bookings : creates
    Users ||--o{ Payments : makes
    Users ||--o{ Notifications : receives
    Users ||--o{ Itineraries : owns
    Users ||--o{ SupportTickets : opens
    Users ||--o{ ChatMessages : sends
    Users ||--o{ AuditLogs : triggers

    Itineraries ||--o{ Trips : contains
    Trips ||--o{ TripDestinations : visits
    Destinations ||--o{ TripDestinations : referenced

    Bookings }o--|| Itineraries : optional
    Payments }o--|| Bookings : settles

    Users {
        int Id PK
        string Email
        string PasswordHash
        string FirstName
        string LastName
        bool IsActive
        datetime CreatedAt
    }

    RefreshTokens {
        int Id PK
        int UserId FK
        string TokenHash
        datetime ExpiresAt
        datetime RevokedAt
    }

    Roles {
        int Id PK
        string Name
    }

    UserRoles {
        int UserId FK
        int RoleId FK
    }

    Itineraries {
        int Id PK
        int UserId FK
        string Title
        string TimelineJson
    }

    Bookings {
        int Id PK
        int UserId FK
        int ItineraryId FK
        string ReferenceCode
        decimal Amount
        string Status
    }

    Payments {
        int Id PK
        int UserId FK
        int BookingId FK
        decimal Amount
        string PaymentStatus
        string ExternalReference
    }

    PaymentTransactionLogs {
        int Id PK
        int PaymentId FK
        string EventType
    }

    Notifications {
        int Id PK
        int UserId FK
        string Title
        string Message
        string Type
        bool IsRead
    }

    SupportTickets {
        int Id PK
        int UserId FK
        string Subject
        string Status
    }

    ChatMessages {
        int Id PK
        int SenderUserId FK
        int ReceiverUserId FK
        string Message
        datetime SentAt
    }

    AuditLogs {
        int Id PK
        int UserId FK
        string Action
        string EntityName
        string Details
        datetime CreatedAt
    }

    Destinations {
        int Id PK
        string Slug
        string Title
        string AdminMetaJson
    }
```

## Service ownership

| Service | Tables |
|---------|--------|
| UserService | Users, RefreshTokens, Roles, UserRoles, TravelPreferences |
| ItineraryService | Itineraries, Trips, Destinations, UserSavedDestinations |
| BookingService | Bookings |
| PaymentService | Payments, PaymentTransactionLogs, Expenses |
| NotificationService | Notifications |
| SupportService | SupportTickets |
| RealTimeCommunicationService | ChatMessages |
| AuditService | *(MongoDB)* `audit_logs` — see below |
| PaymentService (logs only) | *(MongoDB)* `payment_transaction_logs` — see below |

Schema bootstrap: `server/Scripts/lab2DB-memberb-bootstrap.sql`

## Polyglot persistence (NoSQL)

Transactional data (users, bookings, payments, itineraries) stays in **SQL Server** for ACID guarantees. High-volume append-only and cache workloads use **MongoDB** and **Redis**.

### MongoDB (`travel_assistant` database)

| Collection | Service | Purpose |
|------------|---------|---------|
| `audit_logs` | AuditService | Who did what, when — searchable admin audit trail |
| `payment_transaction_logs` | PaymentService | Stripe/PayPal webhook payloads and idempotency (`ExternalEventId` unique index) |
| `counters` | Audit + Payment | Auto-increment sequence for API-facing numeric ids |

Connection: `MongoDb__ConnectionString` in `global-settings.env` (Docker: `mongo:27017`).

### Redis

| Key pattern | Service | TTL | Purpose |
|-------------|---------|-----|---------|
| `weather:current:{city}:{country}` | WeatherExternalDataService | 15 min | Cache Open-Meteo current weather |
| `weather:forecast:{days}:{city}:{country}` | WeatherExternalDataService | 30 min | Cache forecast responses |
| `destinations:catalog:all` | ItineraryService | 10 min | Cache full destination catalog JSON rows |
| `destinations:catalog:{slug}` | ItineraryService | 10 min | Cache single destination by slug |

Connection: `Redis__ConnectionString` in `global-settings.env` (Docker: `redis:6379`).

**Verify at runtime:** `GET /api/ping` on AuditService, PaymentService, WeatherExternalDataService, or ItineraryService reports `storage`, `transactionLogs`, `cache`, or `destinationCatalogCache`.
