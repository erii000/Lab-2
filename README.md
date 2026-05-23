# Lab-2 — Smart Travel Assistant

## Frontend (React)

Requires **Node.js 20+**.

```bash
cd client
npm ci
npm run verify    # lint + production build (run after every pull)
npm run dev
```

See [client/README.md](client/README.md) for details and troubleshooting.

## Backend (.NET)

See [server/README.md](server/README.md) for API services and Docker setup.

## CI

Pull requests that touch `client/` run lint and build via [`.github/workflows/client-ci.yml`](.github/workflows/client-ci.yml).
