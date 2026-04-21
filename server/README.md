# Backend (.NET) Microservices Structure

## Root

- `ApiGateway/` - API Gateway project and routing/auth entry points.
- `Services/` - Independent microservice projects.
- `Shared/` - Shared models, DTOs, utilities, and shared service abstractions.
- `Infrastructure/` - Cross-cutting infrastructure components.

## Service Template (each service)

- `Controllers/`
- `Models/`
- `Services/`
- `Repositories/`
- `DTOs/`
- `<ServiceName>.csproj`
- `Dockerfile`
- `appsettings.json`

## Included Services

- UserService
- ItineraryService
- BookingService
- PaymentService
- NotificationService
- RolePermissionService
- TravelPreferencesService
- WeatherExternalDataService
- SupportService
- AuditService
- RealTimeCommunicationService

## Database Migrations (EF Core)

- This repository uses a local tool manifest (`dotnet-tools.json`) so everyone runs the same EF CLI version.
- First-time setup from repo root: `dotnet tool restore`
- Add a migration (example): `dotnet tool run dotnet-ef migrations add <MigrationName> --project server/Services/ItineraryService/ItineraryService.csproj --startup-project server/Services/ItineraryService/ItineraryService.csproj --context ApplicationDbContext`
- Apply migrations (example): `dotnet tool run dotnet-ef database update --project server/Services/ItineraryService/ItineraryService.csproj --startup-project server/Services/ItineraryService/ItineraryService.csproj --context ApplicationDbContext`
- Member B baseline migrations already exist for:
  - `server/Services/ItineraryService/Migrations`
  - `server/Services/BookingService/Migrations`
  - `server/Services/PaymentService/Migrations`
- These initial `InitialMemberB` migrations are baseline markers for already-provisioned shared Azure DBs (no-op Up/Down), allowing teams to run `database update` safely and then use normal incremental migrations going forward.

### Team Baseline Command Set

1. `dotnet tool restore`
2. `dotnet tool run dotnet-ef database update --project server/Services/ItineraryService/ItineraryService.csproj --startup-project server/Services/ItineraryService/ItineraryService.csproj --context ApplicationDbContext`
3. `dotnet tool run dotnet-ef database update --project server/Services/BookingService/BookingService.csproj --startup-project server/Services/BookingService/BookingService.csproj --context ApplicationDbContext`
4. `dotnet tool run dotnet-ef database update --project server/Services/PaymentService/PaymentService.csproj --startup-project server/Services/PaymentService/PaymentService.csproj --context ApplicationDbContext`

### Example: Next Real Schema Change (PaymentService)

1. Update model + `ApplicationDbContext` mapping (example: add `ProviderFee` to `Payment`).
2. Create migration: `dotnet tool run dotnet-ef migrations add AddProviderFeeToPayments --project server/Services/PaymentService/PaymentService.csproj --startup-project server/Services/PaymentService/PaymentService.csproj --context ApplicationDbContext`
3. Review generated files in `server/Services/PaymentService/Migrations`.
4. Apply migration: `dotnet tool run dotnet-ef database update --project server/Services/PaymentService/PaymentService.csproj --startup-project server/Services/PaymentService/PaymentService.csproj --context ApplicationDbContext`
5. Commit model + context + migration files together.

## Dockerized Local Stack

The repository now includes a full Docker Compose setup for runnable services:

- `ApiGateway`
- `UserService`
- `ItineraryService`
- `BookingService`
- `PaymentService`
- `NotificationService`
- `AuditService`
- `RealTimeCommunicationService`
- `SupportService`
- `WeatherExternalDataService`
- `client` (Vite build served by nginx)
- SQL Server (`mcr.microsoft.com/mssql/server:2022-latest`)

> `RolePermissionService` and `TravelPreferencesService` are currently scaffolds (no `Program.cs`), so they are not included in Compose runtime yet.

### Run

From `server/`:

1. `copy .env.docker.example .env` (Windows) or `cp .env.docker.example .env` (macOS/Linux)
2. Update `.env` secrets (`MSSQL_SA_PASSWORD`, `JWT__SECRETKEY`, and optional provider keys).
3. `docker compose build`
4. `docker compose up -d`
5. `docker compose ps`

### Stop

- `docker compose down`
- `docker compose down -v` (also remove DB volume)

### Common Endpoints

- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:5161/swagger`
- UserService: `http://localhost:62381/swagger`
- BookingService: `http://localhost:63191/swagger`
- PaymentService: `http://localhost:63187/swagger`

### Notes

- Compose reads runtime secrets/config from `server/.env` (via variable substitution in `docker-compose.yml`).
- Keep `server/.env` local-only; use `.env.docker.example` as the sharable template.
