# Migration Map (Completed Baseline)

## ApiGateway

- `Program.cs` migrated and adapted for gateway startup.
- `Configuration/JwtOptions.cs` migrated.
- `Controllers/StatusController.cs` migrated.
- `appsettings.json` and `appsettings.Development.json` migrated.

## Services/UserService

- `Controllers/AuthController.cs`
- `DTOs/Auth/*`
- `Models/*` (entities + enum)
- `Repositories/*` (in-memory repository implementations)
- `Interfaces/*` (repository + auth interfaces)
- `Services/AuthService.cs`
- `Data/ApplicationDbContext.cs`
- `Migrations/*`

## Services/NotificationService

- `Controllers/NotificationsController.cs`
- `DTOs/Notifications/*`

## Services/RealTimeCommunicationService

- `Hubs/NotificationsHub.cs`
- `Interfaces/IRealtimeNotificationService.cs`
- `Services/RealtimeNotificationService.cs`
