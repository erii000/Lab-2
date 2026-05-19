# Lab-2 — Smart Travel Assistant

## Frontend (React)

```bash
cd client
npm ci
npm run lint
npm run build
npm run dev
```

See [client/README.md](client/README.md) for details.

## Backend (.NET)

See [server/README.md](server/README.md) for API services and Docker setup.

## CI

Pull requests that touch `client/` run lint and build via [`.github/workflows/client-ci.yml`](.github/workflows/client-ci.yml).
