FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["TravelAssistant.Common/TravelAssistant.Common.csproj", "TravelAssistant.Common/"]
COPY ["server/Services/AuditService/AuditService.csproj", "server/Services/AuditService/"]
RUN dotnet restore "server/Services/AuditService/AuditService.csproj"

COPY . .
WORKDIR "/src/server/Services/AuditService"
RUN dotnet publish "AuditService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AuditService.dll"]
