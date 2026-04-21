FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Services/PaymentService/PaymentService.csproj", "Services/PaymentService/"]
RUN dotnet restore "Services/PaymentService/PaymentService.csproj"

COPY . .
WORKDIR "/src/Services/PaymentService"
RUN dotnet publish "PaymentService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PaymentService.dll"]
