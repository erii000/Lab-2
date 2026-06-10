# Infrastructure (placeholder)

These subfolders (`Database/`, `Logging/`, `Monitoring/`, `Redis/`) are **scaffolding** from the team backlog template.

Shared database bootstrap lives in `server/Scripts/lab2DB-memberb-bootstrap.sql` and runs inside each microservice via `TravelAssistant.Common.Database.Lab2DbSchemaBootstrap`.

Redis and MongoDB containers are defined in `docker-compose.yml` for future caching/document features but are **not used** by the current .NET services.
