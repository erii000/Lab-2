FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Services/BookingService/BookingService.csproj", "Services/BookingService/"]
RUN dotnet restore "Services/BookingService/BookingService.csproj"

COPY . .
WORKDIR "/src/Services/BookingService"
RUN dotnet publish "BookingService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "BookingService.dll"]
