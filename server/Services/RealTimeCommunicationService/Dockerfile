FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Services/RealTimeCommunicationService/RealTimeCommunicationService.csproj", "Services/RealTimeCommunicationService/"]
RUN dotnet restore "Services/RealTimeCommunicationService/RealTimeCommunicationService.csproj"

COPY . .
WORKDIR "/src/Services/RealTimeCommunicationService"
RUN dotnet publish "RealTimeCommunicationService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "RealTimeCommunicationService.dll"]
