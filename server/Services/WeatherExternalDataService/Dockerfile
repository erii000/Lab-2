FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["TravelAssistant.Common/TravelAssistant.Common.csproj", "TravelAssistant.Common/"]
COPY ["server/Services/WeatherExternalDataService/WeatherExternalDataService.csproj", "server/Services/WeatherExternalDataService/"]
RUN dotnet restore "server/Services/WeatherExternalDataService/WeatherExternalDataService.csproj"

COPY . .
WORKDIR "/src/server/Services/WeatherExternalDataService"
RUN dotnet publish "WeatherExternalDataService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "WeatherExternalDataService.dll"]
