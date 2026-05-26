# Azure SQL (lab2DB) — team setup

All API services use **`global-settings.env`** → `sqladminlab.database.windows.net` / `lab2DB`.

## One-time (lab admin)

In Azure Portal → SQL server **sqladminlab** → **Networking**:

- Enable **Allow Azure services and resources to access this server**
- For class/lab dev, add firewall rule **0.0.0.0 – 255.255.255.255** (or each teammate’s public IP)

Without this, Docker cannot write to Azure and tables stay empty in SSMS.

## Run stack

```powershell
cd server
docker compose up --build
```

Frontend: `npm run dev` in `client/` (proxy `http://localhost:5161`).

## Shared data

- On **login**, local bookings are uploaded to Azure, then merged from the API.
- **Admin dashboard** reads paid bookings from Azure (same for every teammate).
- User **drafts** stay in the browser until payment; paid trips are in `Bookings` / `Payments`.

## Check API ↔ Azure

`GET http://localhost:63191/api/diagnostics/db` → `"database": "connected"`

Optional local SQL only: `docker compose --profile local-sql up` (not used for team sharing).
