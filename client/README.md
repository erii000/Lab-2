# Smart Travel Assistant — Frontend

React + Vite app for destination discovery, trip configuration, and bookings.

## Requirements

- **Node.js 20+** (LTS recommended)
- **npm 10+**

## Setup (for teammates)

```bash
cd client
npm ci
```

Use `npm ci` (not `npm install`) so everyone gets the exact dependency versions from `package-lock.json`.

## Verify before you push

```bash
npm run lint
npm run build
```

Both commands must exit with code **0**. GitHub Actions runs the same checks on pull requests.

## Development

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Local dev server + HMR   |
| `npm run build`| Production build to `dist/` |
| `npm run lint` | ESLint across `src/`     |
| `npm run preview` | Preview production build |

## Notes

- Bookings and drafts are stored in the browser (`localStorage` key `sta-bookings-v1`).
- The backend in `../server` is optional for this UI shell; no API is required to run the client.
