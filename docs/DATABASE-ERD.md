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
| AuditService | AuditLogs |

Schema bootstrap: `server/Scripts/lab2DB-memberb-bootstrap.sql`
