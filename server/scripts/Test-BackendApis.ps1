#Requires -Version 5.1
<#
  Smoke-test API Gateway and a few reverse-proxied paths.
  Run services locally or via Docker, then:
    ./Test-BackendApis.ps1 -BaseUrl "http://localhost:62377"
    ./Test-BackendApis.ps1 -BaseUrl "http://localhost:5161"
#>
param(
    [string] $BaseUrl = "http://localhost:62377"
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")

function Test-Route {
    param([string] $Method, [string] $Path, [int[]] $Ok = @(200, 204, 401, 403, 404))
    $uri = "$BaseUrl$Path"
    try {
        $r = Invoke-WebRequest -Method $Method -Uri $uri -UseBasicParsing -TimeoutSec 15
        $code = $r.StatusCode
    } catch {
        $resp = $_.Exception.Response
        if ($resp -and $resp.StatusCode) {
            $code = [int]$resp.StatusCode
        } else {
            Write-Host "FAIL $Method $uri - $($_.Exception.Message)" -ForegroundColor Red
            return
        }
    }
    if ($Ok -contains $code) {
        Write-Host "OK   $code  $Method $Path" -ForegroundColor Green
    } else {
        Write-Host "WARN $code  $Method $Path (expected one of: $($Ok -join ','))" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Travel Assistant backend smoke tests ===" -ForegroundColor Cyan
Write-Host "Base: $BaseUrl"
Write-Host ""

Test-Route GET "/health" -Ok @(200)
Test-Route GET "/api/gateway-test" -Ok @(200)
Test-Route GET "/api/status" -Ok @(200)
Test-Route GET "/api/health/upstreams" -Ok @(200)

# Proxied paths (401 without JWT is OK)
Test-Route GET "/api/v1/users/me" -Ok @(401, 403)
Test-Route GET "/api/v1/itineraries/search" -Ok @(401, 403)
Test-Route GET "/api/v1/bookings/search" -Ok @(401, 403)
Test-Route GET "/api/v1/payments/search" -Ok @(401, 403)
Test-Route GET "/api/v1/notifications/search" -Ok @(401, 403)
Test-Route GET "/api/v1/auditlogs" -Ok @(401, 403)
Test-Route GET "/api/v1/weather/current?city=Paris" -Ok @(401, 403, 404, 502)

Write-Host ""
Write-Host "Done. HTTP 401/403 on protected routes without a Bearer token is expected."
Write-Host ""
