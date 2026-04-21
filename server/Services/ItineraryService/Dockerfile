FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Services/ItineraryService/ItineraryService.csproj", "Services/ItineraryService/"]
RUN dotnet restore "Services/ItineraryService/ItineraryService.csproj"

COPY . .
WORKDIR "/src/Services/ItineraryService"
RUN dotnet publish "ItineraryService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ItineraryService.dll"]
