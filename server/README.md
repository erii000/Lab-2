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
