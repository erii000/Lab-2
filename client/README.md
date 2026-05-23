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

## State management

Global client state lives in `src/store/` (Zustand with `persist`):

| Store | Responsibility |
| ----- | ---------------- |
| `authStore` | Session, login/logout (syncs traveler profile to bookings) |
| `bookingStore` | Bookings, drafts, saved destinations |
| `plannerStore` | Itinerary planner (syncs to booking drafts) |
| `exploreStore` | Recent explore searches |
| `contactDraftStore` | Contact form draft |
| `assistantStore` | AI assistant query and last generated plan |
| `admin*Store` | Admin bookings, trips, users, settings, notifications |

Import hooks from `src/store/index.js` or individual store files. UI feedback uses `ToastContext`; async flows can use `useLoading()` / `runWithLoader` (top progress bar).

## Bonus features (lab)

| Feature | Where to try |
| -------- | ------------- |
| **ML recommendations** | Home — personalized destination scores |
| **ML vision** | Explore — upload a travel photo |
| **ML predictive analytics** | Admin → Dashboard |
| **Advanced search** (5 lists) | Explore, Bookings dashboard, Admin Bookings / Users / Trips |
| **Stripe / PayPal checkout** | Booking flow → Traveler & payment (demo card `4242…`, decline test `…0002`) |
| **Dynamic reports** | Admin → Reports — CSV export & print/PDF |
