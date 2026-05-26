# Database — Schema, Ownership & Connection Guide

## Overview

All services share **one SQL Server database**: `lab2DB` (hosted on Azure in the team environment, or a local MSSQL container for solo dev).

Even though it is one database, each microservice has **its own `ApplicationDbContext`** and only sees/touches its own tables. There are no cross-service EF navigation properties. Foreign keys that cross service boundaries (e.g. `Bookings.UserId` → `Users.Id`) are **logical** (understood by developers) but **not enforced at the database level** (no FK constraint crossing service boundaries). This is the microservice pattern.

---

## Connection string

Set in `server/global-settings.env` (never committed):

```
ConnectionStrings__DefaultConnection=Server=tcp:sqladminlab.database.windows.net,1433;Initial Catalog=lab2DB;User ID=sqladmin;Password=...;Encrypt=True;TrustServerCertificate=True;
```

All services read the same environment variable. In Docker Compose, this is injected from `global-settings.env` automatically.

**Local dev alternatives:**

```
# LocalDB (Windows only)
Server=(localdb)\mssqllocaldb;Database=lab2DB;Trusted_Connection=True;TrustServerCertificate=True;

# Docker MSSQL (cross-platform)
Server=mssql,1433;Initial Catalog=lab2DB;User ID=sa;Password=Strong_pass_123;Encrypt=False;
```

---

## EF Core Migrations

Each service with a DB context has its own migrations folder. Run migrations per service:

```bash
dotnet ef database update --project server/Services/UserService/UserService.csproj
dotnet ef database update --project server/Services/ItineraryService/ItineraryService.csproj
dotnet ef database update --project server/Services/BookingService/BookingService.csproj
dotnet ef database update --project server/Services/PaymentService/PaymentService.csproj
dotnet ef database update --project server/Services/NotificationService/NotificationService.csproj
dotnet ef database update --project server/Services/AuditService/AuditService.csproj
dotnet ef database update --project server/Services/SupportService/SupportService.csproj
dotnet ef database update --project server/Services/RealTimeCommunicationService/RealTimeCommunicationService.csproj
dotnet ef database update --project server/Services/WeatherExternalDataService/WeatherExternalDataService.csproj
```

Alternatively, `Lab2DbSchemaBootstrap.cs` in `TravelAssistant.Common` contains raw DDL to create the Azure lab schema (used for the shared team database setup).

---

## Table ownership map

| Service | Tables |
|---------|--------|
| UserService | `Users`, `RefreshTokens`, `Roles`, `UserRoles` |
| ItineraryService | `Itineraries`, `ItineraryDays`, `ItineraryDayActivities`, `TravelPreferences`, `Trips`, `Destinations`, `TripDestinations`, `TripParticipants`, `UserSavedDestinations` |
| BookingService | `Bookings`, `Hotels`, `Flights`, `TransportOptions`, `SavedTrips` |
| PaymentService | `Payments`, `Expenses`, `PaymentTransactionLogs` |
| NotificationService | `Notifications` |
| AuditService | `AuditLogs` |
| SupportService | `SupportTickets` |
| RealTimeCommunicationService | `ChatMessages` |
| WeatherExternalDataService | `WeatherData` |

---

## Table schemas

### UserService tables

#### `Users`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | Auto-increment |
| `FirstName` | NVARCHAR | Required |
| `LastName` | NVARCHAR | Required |
| `Email` | NVARCHAR | Unique, indexed |
| `PasswordHash` | NVARCHAR | BCrypt hash, never plain text |
| `IsActive` | BIT | Soft-disable account |
| `CreatedAt` | DATETIME2 | UTC |

#### `RefreshTokens`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `UserId` | INT FK→Users | |
| `TokenHash` | NVARCHAR | BCrypt hash of the opaque token |
| `ExpiresAt` | DATETIME2 | Token expiry |
| `RevokedAt` | DATETIME2? | Set on logout/rotation; NULL = active |
| `CreatedAt` | DATETIME2 | |

#### `Roles`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `Name` | NVARCHAR | `Admin`, `Support`, `User` |

#### `UserRoles`
| Column | Type | Notes |
|--------|------|-------|
| `UserId` | INT FK→Users | Composite PK |
| `RoleId` | INT FK→Roles | Composite PK |

---

### ItineraryService tables

#### `Itineraries`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `UserId` | INT | Logical FK → Users |
| `Title` | NVARCHAR | |
| `Destination` | NVARCHAR | |
| `StartDate` | DATE | |
| `EndDate` | DATE | |
| `Guests` | INT | |
| `Budget` | DECIMAL | |
| `TimelineJson` | NVARCHAR(MAX) | Client-edited day/activity JSON |
| `CreatedAt` | DATETIME2 | |

#### `ItineraryDays`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `ItineraryId` | INT FK→Itineraries | |
| `DayNumber` | INT | |
| `Date` | DATE | |
| `Notes` | NVARCHAR | |

#### `ItineraryDayActivities`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `DayId` | INT FK→ItineraryDays | |
| `Title` | NVARCHAR | |
| `StartTime` | NVARCHAR | e.g. "09:30" |
| `DurationMinutes` | INT | |
| `Category` | NVARCHAR | hotel, activity, transport, etc. |
| `Cost` | DECIMAL | |

#### `TravelPreferences`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `UserId` | INT | Unique — one preference set per user |
| `PreferredClimate` | NVARCHAR | |
| `TravelStyle` | NVARCHAR | |
| `MaxBudget` | DECIMAL | |
| `PreferredActivitiesJson` | NVARCHAR | JSON array |
| `UpdatedAt` | DATETIME2 | |

#### `Destinations`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `Slug` | NVARCHAR | Unique identifier (e.g. `paris-france`) |
| `CatalogJson` | NVARCHAR(MAX) | Full destination catalog entry as JSON |
| `AdminMetaJson` | NVARCHAR(MAX) | Admin overrides (status, custom image, etc.) |
| `UpdatedAt` | DATETIME2 | |

#### `UserSavedDestinations`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `UserId` | INT | |
| `DestinationSlug` | NVARCHAR | |
| `SavedAt` | DATETIME2 | |

---

### BookingService tables

#### `Bookings`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `UserId` | INT | Logical FK → Users |
| `ItineraryId` | INT? | Logical FK → Itineraries |
| `ReferenceCode` | NVARCHAR | Unique human-readable code |
| `BookingType` | NVARCHAR | `package`, `flight`, `hotel`, etc. |
| `Provider` | NVARCHAR | Service provider name |
| `Amount` | DECIMAL | |
| `Currency` | NVARCHAR | ISO 4217 (EUR, USD, GBP…) |
| `Status` | NVARCHAR | `Pending`, `Confirmed`, `Completed`, `Cancelled`, `Refunded`, `PartiallyRefunded` |
| `BookingDate` | DATE | |
| `MetadataJson` | NVARCHAR(MAX) | Extra booking metadata |
| `CreatedAt` | DATETIME2 | |
| `UpdatedAt` | DATETIME2 | |

**Status transitions** (enforced in `BookingStatusTransitions.cs`):
```
Pending → Confirmed (Admin)
Pending → Cancelled (User or Admin)
Confirmed → Completed (Admin)
Confirmed → Cancelled (Admin)
Confirmed → Refunded (Admin)
Confirmed → PartiallyRefunded (Admin)
```

---

### PaymentService tables

#### `Payments`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `UserId` | INT | Logical FK → Users |
| `BookingId` | INT | Logical FK → Bookings |
| `Amount` | DECIMAL | |
| `Currency` | NVARCHAR | |
| `PaymentMethod` | NVARCHAR | `card`, `paypal`, `lab` |
| `PaymentStatus` | NVARCHAR | `Pending`, `Completed`, `Failed`, `Refunded` |
| `ExternalReference` | NVARCHAR? | Stripe session ID / PayPal order ID / `LAB-...` |
| `CreatedAt` | DATETIME2 | |

#### `PaymentTransactionLogs`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `PaymentId` | INT FK→Payments | |
| `Event` | NVARCHAR | `created`, `completed`, `refunded`, webhook event type |
| `Details` | NVARCHAR(MAX) | Raw webhook payload or service message |
| `CreatedAt` | DATETIME2 | |

---

### NotificationService tables

#### `Notifications`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `UserId` | INT | Logical FK → Users |
| `Title` | NVARCHAR | |
| `Message` | NVARCHAR | |
| `Type` | NVARCHAR | `system`, `booking`, `payment`, `alert` |
| `IsRead` | BIT | |
| `CreatedAt` | DATETIME2 | |

---

### AuditService tables

#### `AuditLogs`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `UserId` | INT? | Who triggered the action |
| `Action` | NVARCHAR | e.g. `Register`, `Login`, `PaymentCompleted` |
| `EntityName` | NVARCHAR | e.g. `User`, `Booking`, `Payment` |
| `Details` | NVARCHAR | Human-readable detail |
| `CreatedAt` | DATETIME2 | |

---

### SupportService tables

#### `SupportTickets`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `UserId` | INT? | NULL for anonymous contact form |
| `Subject` | NVARCHAR | |
| `Description` | NVARCHAR(MAX) | |
| `Status` | NVARCHAR | `Open`, `InProgress`, `Resolved`, `Closed` |
| `Priority` | NVARCHAR | `Low`, `Medium`, `High`, `Urgent` |
| `CreatedAt` | DATETIME2 | |
| `UpdatedAt` | DATETIME2 | |

---

### RealTimeCommunicationService tables

#### `ChatMessages`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `SenderUserId` | INT | 0 = AI assistant |
| `ReceiverUserId` | INT | |
| `Message` | NVARCHAR(MAX) | |
| `SentAt` | DATETIME2 | |

---

### WeatherExternalDataService tables

#### `WeatherData`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT PK | |
| `City` | NVARCHAR | |
| `Country` | NVARCHAR | |
| `Temperature` | FLOAT | Celsius |
| `Description` | NVARCHAR | |
| `FetchedAt` | DATETIME2 | Cache timestamp |

---

## Entity Relationship Diagram (simplified)

```
Users ──────────────────────────────────────────────────────────────────┐
  │ Id                                                                   │
  │                                                                      │
  ├──► RefreshTokens (UserId)                                           │
  ├──► UserRoles (UserId) ◄──── Roles                                  │
  ├──► Itineraries (UserId)                                             │
  │      └──► ItineraryDays (ItineraryId)                               │
  │               └──► ItineraryDayActivities (DayId)                   │
  ├──► TravelPreferences (UserId, unique)                               │
  ├──► UserSavedDestinations (UserId)                                   │
  ├──► Bookings (UserId)          ──── Itineraries (ItineraryId)       │
  │      └──► Payments (BookingId)                                      │
  │               └──► PaymentTransactionLogs (PaymentId)              │
  ├──► Notifications (UserId)                                           │
  ├──► SupportTickets (UserId?)                                         │
  ├──► ChatMessages (SenderUserId / ReceiverUserId)                    │
  └──► AuditLogs (UserId?)                                             │
                                                                        │
Destinations ─────────────────────────────────────────────────────────┘
  └──► UserSavedDestinations (DestinationSlug)
  └──► TripDestinations (DestinationId)
```

**Note:** Arrows represent logical relationships, not enforced DB foreign keys across service boundaries.

---

## How to add a new migration

When you change a model in a service:

```bash
# From repo root, example for BookingService:
dotnet ef migrations add YourMigrationName \
  --project server/Services/BookingService/BookingService.csproj \
  --startup-project server/Services/BookingService/BookingService.csproj

dotnet ef database update \
  --project server/Services/BookingService/BookingService.csproj
```

Migrations are stored in `server/Services/{ServiceName}/Migrations/`.

---

## Database seeding

`UserService` seeds on startup via `ReferenceDataSeeder`:
1. Creates `Admin`, `Support`, `User` roles if they don't exist
2. Creates an admin account `admin@smarttravel.app` / `admin12345` if no admin exists

`ItineraryService` seeds via `DestinationCatalogSeeder` and `TripCatalogSeeder` (populates destination data from static JSON).

---

## Azure lab2DB bootstrap

For the shared team Azure database (where EF migrations cannot be run directly due to permission limits), `TravelAssistant.Common/Database/Lab2DbSchemaBootstrap.cs` contains raw `CREATE TABLE IF NOT EXISTS` DDL statements. This is called once during first-run setup.
