FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Services/SupportService/SupportService.csproj", "Services/SupportService/"]
RUN dotnet restore "Services/SupportService/SupportService.csproj"

COPY . .
WORKDIR "/src/Services/SupportService"
RUN dotnet publish "SupportService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SupportService.dll"]
