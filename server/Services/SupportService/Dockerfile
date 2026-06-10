FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["TravelAssistant.Common/TravelAssistant.Common.csproj", "TravelAssistant.Common/"]
COPY ["server/Services/SupportService/SupportService.csproj", "server/Services/SupportService/"]
RUN dotnet restore "server/Services/SupportService/SupportService.csproj"

COPY . .
WORKDIR "/src/server/Services/SupportService"
RUN dotnet publish "SupportService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
COPY --from=build /src/server/Scripts/lab2DB-memberb-bootstrap.sql ./Scripts/lab2DB-memberb-bootstrap.sql
ENTRYPOINT ["dotnet", "SupportService.dll"]
