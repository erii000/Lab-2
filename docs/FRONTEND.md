# Frontend — React Application Reference

**Stack:** React 18, Vite, React Router v6, Material UI v6, Zustand, `@microsoft/signalr`

**Entry point:** `client/src/main.jsx` → `AppProviders` → `RouterProvider`

---

## Project structure overview

```
client/src/
├── api/            HTTP client modules (one file per backend resource)
├── components/     Reusable UI components (grouped by domain)
├── context/        React Context providers
├── data/           Static data (destination catalog)
├── hooks/          Custom React hooks
├── layouts/        Page shell layouts (Main, Admin, Auth)
├── pages/          Route-level page components
├── services/       Side-effect orchestration (sync, SignalR connections)
├── store/          Zustand state stores
├── theme/          MUI theme configuration
├── ui/             Icon re-exports
└── utils/          Pure helper functions
```

---

## Layouts

### `RootLayout.jsx`
Wraps the entire application. Provides `AppProviders` (all contexts: Theme, Toast, Notifications). Contains `<Suspense>` for lazy-loaded pages with a `PageLoader` fallback.

### `MainLayout.jsx`
Used for all public and authenticated user pages. Renders the `Navbar` at the top and `Footer` at the bottom. Checks backend connectivity on mount.

### `AuthLayout.jsx`
Minimal shell for `LoginPage` and `RegisterPage` — no navbar or footer.

### `AdminLayout.jsx`
- Checks that the logged-in user has role `admin`. Redirects to `/login` if not authenticated.
- Renders a collapsible side navigation drawer (`NavList`) with links to all admin pages.
- **Sidebar items:** Dashboard, Trips, Bookings, Users, Reports, Data exchange, Settings
- On mount, hydrates all admin Zustand stores from the API.
- Runs `useAdminRealtimeRefresh()` to subscribe to SignalR updates and refresh admin stores live.

---

## Pages (routes)

### Public / User pages

#### `HomePage.jsx` — `/`
Landing page. Sections:
- `HeroSearchBar` — destination search with date pickers
- `FeaturedDestinations` — highlights from catalog
- `HowItWorks` — 3-step explainer
- `TrustStats` — animated counters (bookings, destinations, travelers)
- `Testimonials`

#### `SearchPage.jsx` — `/explore`
Full destination catalog search. Uses `exploreSearch.js` utilities for client-side filtering. Components: `HeroSearchBar`, `ExploreFilters`, `ExploreTrending`, `VisionUploadAnalyzer` (AI image search).

#### `DestinationDetailPage.jsx` — `/destination/:id`
Detailed destination view. Sub-components:
- `DestinationExploreHero` — hero image with title, tagline
- `AiSummaryBar` — AI-generated trip summary
- `StickyExploreFilters` — filter bar for trip options
- `CuratedDeparturesRow` — departure date/pricing cards
- `ItineraryGeneratorDialog` — trigger AI itinerary generation
- `SmartTripDrawer` — trip configuration panel
- `DestinationGalleryStrip` — image gallery
- `StickyTripSummary` — fixed summary strip with CTA

#### `ItineraryPlannerPage.jsx` — `/itinerary`
The main trip planning canvas. State comes from `usePlannerStore`.
- `PlannerToolbar` — title, save button, book CTA
- Day cards with activity lists
- `AiAssistDrawer` — AI suggestions panel
- `TripSummaryPanel` — cost breakdown, guest count
- Saves timeline to server via `itinerarySync.js`

#### `BookingPage.jsx` — `/booking`
Creates a booking from the current planner trip. Calls `bookingSync.js` → `POST /api/v1/bookings`.

#### `BookingsDashboardPage.jsx` — `/bookings`
User's booking list with `AdvancedListToolbar` (full-text search + sort). Shows each booking as a `BookingCard`. Uses `useBookingStore`.

#### `BookingDetailsPage.jsx` — `/bookings/:bookingId`
Single booking detail. Shows status, `BookingProgressBar`, traveler info, timeline.

#### `BookingTravelerPage.jsx` — `/bookings/:bookingId/traveler`
Traveler details step. Contains `SecureCheckoutForm` for payment card input. On submit triggers `paymentCheckout.js` → `POST /api/v1/payments/checkout` → `POST /api/v1/bookings/:id/confirm-payment`.

#### `BookingSuccessPage.jsx` — `/bookings/:bookingId/success`
Confirmation page after payment. Creates a `success` notification via API.

#### `ContactPage.jsx` — `/contact`
- `ContactHero` — availability info
- `ContactForm` — submits to `POST /api/v1/supporttickets/contact`
- `ContactFaqPreview` — FAQ accordion
- `ContactSupportChannels` — links and phone
- `ContactEmergency` — emergency modals: `FlightAssistanceModal`, `LostBookingRecoveryModal`, `EmergencyHotlineModal`

#### `AiAssistantPage.jsx` — `/assistant`
Chat interface. Input field sends to `POST /api/v1/chat` via `chatSync.js`. Receives AI replies pushed back over SignalR `chatMessage` event. Also links to `ItineraryGeneratorDialog`.

#### `NotificationsPage.jsx` — `/notifications`
Lists all notifications from `NotificationsContext`. Mark-as-read calls `PATCH /api/v1/notifications/:id/read`.

#### `LoginPage.jsx` / `RegisterPage.jsx`
Standard auth forms. On success, `authStore.login()` / `authStore.register()` is called → fetches `/me` → hydrates stores.

---

### Admin pages — `/admin/*`

All admin pages require role `admin` (enforced by `AdminLayout`).

#### `AdminDashboardPage.jsx` — `/admin`
Executive summary view.
- KPI metric cards (total bookings, revenue, users, AI score) from `computeDashboardKpis()`
- `RevenueBookingsChart` — bar chart by period
- `DashboardRecentBookings` — last 5 bookings table
- `BookingStatusBars` — status breakdown progress bars
- `TopTripsBars` — most-booked destinations
- `SmartInsightsPanel` — AI-generated text insights from `generateSmartInsights()`
- `MlPredictiveInsights` — predictive analytics from `mlPredictive.js`

#### `AdminTripsPage.jsx` — `/admin/trips`
Manages the destination catalog as admin "trips".
- `AdvancedListToolbar` — full-text search + sort + filter pills
- `AdminDataExchangeBar` — export/import itineraries
- Grid of `TripAdminCard` components
- `TripWorkspaceDrawer` — edit trip details, images, status
- `CreateTripDrawer` — create new catalog entry
- `TripsBulkActionsBar` — bulk archive/publish selected

#### `AdminBookingsPage.jsx` — `/admin/bookings`
All bookings table.
- `AdminDataExchangeBar` — export/import bookings
- `AdvancedListToolbar` — search, sort, status filter
- Status inline editing via `BookingStatusSelect`
- Row click opens `BookingDetailDrawer`
- `CancelBookingModal` and `RefundBookingModal` for those status transitions

#### `AdminUsersPage.jsx` — `/admin/users`
User management table.
- `AdminDataExchangeBar` — export/import users
- `AdvancedListToolbar` — full-text search + sort
- Status filter chips (All, Active, Inactive, Suspended)
- Row action menu: activate, deactivate, suspend, delete
- `UserDetailDrawer` — full user profile
- `InviteUserModal` — create new user account
- `UsersBulkBar` — bulk status changes

#### `AdminReportsPage.jsx` — `/admin/reports`
Wraps `AdminReportsBuilder`.
- Select report type (bookings, users, trips)
- Date range and status filters
- Preview table
- Export CSV button (client-side from store data)
- Print button (opens printable HTML report in new tab)

#### `AdminDataExchangePage.jsx` — `/admin/data`
Tabbed import/export hub for all 5 resources.
- Tabs: Users, Bookings, Payments, Itineraries, Notifications
- Each tab renders `AdminDataExchangeBar` for that resource
- Export formats: JSON, CSV, XLSX (calls backend API, triggers file download)
- Import: upload a JSON file; parses it, POSTs to backend import endpoint
- `?` button downloads a sample import JSON for that resource

#### `AdminSettingsPage.jsx` — `/admin/settings`
Settings sections: General, Payments, Preferences. Persisted in `useAdminSettingsStore`.

---

## Zustand stores (`client/src/store/`)

All stores use `persist` middleware with `localStorage` unless noted. This means state survives page refresh.

### `authStore.js` — key: `sta-auth-v2`

| State | Type | Description |
|-------|------|-------------|
| `session` | object \| null | `{ userId, email, name, role, accessToken, refreshToken, expiresAtUtc }` |

Key actions:
- `login(credentials)` — calls `POST /api/v1/auth/login`, then `GET /api/v1/users/me`, then hydrates admin stores if admin
- `register(payload)` — same flow
- `logout()` — calls `POST /api/v1/auth/logout`, clears session
- `ensureAccessToken()` — checks expiry, proactively calls `/api/v1/auth/refresh` if within 60 s of expiry; returns valid access token

### `bookingStore.js` — key: `sta-booking-v3`

| State | Description |
|-------|-------------|
| `bookings[]` | User's booking list |
| `currentBookingId` | Currently active booking |
| `savedDestinations[]` | Saved/wishlist destination slugs |

Syncs from API via `bookingSync.js` on login.

### `plannerStore.js` — key: `sta-planner-v1`

| State | Description |
|-------|-------------|
| `trip` | Full trip object (destination, dates, days, activities, pricing) |
| `linkedBookingId` | Server booking ID once created |
| `itinerarySyncing` | Boolean loading flag |

### `adminBookingsStore.js` — key: `sta-admin-bookings-v1`

| Action | Description |
|--------|-------------|
| `hydrateFromApi(token)` | Fetches all bookings from `GET /api/v1/bookings/search` |
| `updateBookingStatus(id, status)` | Patches status via API |
| `approveBooking(id)` | Transitions to Confirmed |
| `cancelBooking(id, payload)` | Cancels + optional refund |
| `refundBooking(id, payload)` | Issues refund |

### `adminTripsStore.js` — key: `sta-admin-trips-v1`

Manages destination catalog trips. `hydrateFromApi` calls `GET /api/v1/destinations` and builds admin-shaped trip objects via `buildCatalogAdminTrips()`.

### `adminUsersStore.js` — key: `sta-admin-users-v1`

`hydrateFromApi` calls `GET /api/v1/users?pageSize=500`. Provides `updateUser`, `inviteUser`, `deactivateUser`, `suspendUser`, `deleteUser`, `bulkSetStatus`, `bulkDeactivate`, `bulkDelete`.

### `adminNotificationsStore.js` — in-memory (no persist)

`hydrateFromApi` calls `GET /api/v1/notifications`. Simple list with `markRead`, `deleteNotification`.

---

## API modules (`client/src/api/`)

Each file is a thin wrapper around `apiRequest` from `client.js`.

### `client.js`
- `ApiError` class — has `status` and `body` properties
- `apiRequest(path, options)` — adds `Authorization: Bearer` from `options.token`, sets `Content-Type: application/json` if `options.json` is provided, throws `ApiError` on non-2xx

### `config.js`
- `API_BASE_URL` — reads from `VITE_API_BASE_URL` env var; defaults to `""` in dev (Vite proxy routes `/api` and `/hubs` to the gateway)

### API file reference

| File | Key functions |
|------|--------------|
| `authApi.js` | `login`, `register`, `refresh`, `logout`, `getMe` |
| `usersApi.js` | `listUsers`, `patchUser` |
| `bookingsApi.js` | `listMyBookings`, `getBooking`, `createBooking`, `patchBooking`, `patchBookingStatus`, `confirmBookingPayment`, `discardBooking`, `searchBookings` |
| `itinerariesApi.js` | `searchTrips`, `generateItinerary`, `getItinerary`, `saveItineraryTimeline` |
| `destinationsApi.js` | `listDestinations`, `getDestination`, `patchDestinationAdminMeta` |
| `savedDestinationsApi.js` | `listSavedDestinations`, `saveDestination`, `removeSavedDestination` |
| `paymentsApi.js` | `createCheckoutSession`, `getPayment` |
| `notificationsApi.js` | `listMyNotifications`, `listAllNotifications`, `markNotificationRead`, `createNotification` |
| `supportApi.js` | `createContactTicket` |
| `travelPreferencesApi.js` | `getMyTravelPreferences`, `upsertMyTravelPreferences`, `getUserTravelPreferences`, `upsertUserTravelPreferences` |
| `chatApi.js` | `listMyChatMessages`, `sendChatMessage` |
| `dataExchangeApi.js` | `downloadResourceExport`, `importResourceRows`, `DATA_EXCHANGE_RESOURCES` |

---

## Services (`client/src/services/`)

These modules handle side-effects that coordinate multiple API calls or bridge stores with real-time.

| File | Purpose |
|------|---------|
| `bookingSync.js` | `pushBookingToApi` — creates booking on server; `syncBookingsFromApi` — loads bookings into store |
| `itinerarySync.js` | `ensurePlannerItinerary` — creates or loads server itinerary for the planner; `hydratePlannerFromApi` — loads existing itinerary into planner store |
| `paymentCheckout.js` | `checkoutBookingPayment` — full payment flow: ensure server booking exists → call checkout API → confirm-payment → notify |
| `adminDataSync.js` | `hydrateAdminData` — refreshes all admin stores |
| `realtimeNotificationsHub.js` | `connectNotificationsHub(token, onTravelUpdate)` — creates SignalR connection to `/hubs/notifications`, auto-reconnects |
| `realtimeChatHub.js` | `connectChatHub(token, onMessage)` — creates SignalR connection to `/hubs/chat` |
| `travelUpdateBus.js` | Simple pub/sub bus — other components subscribe; `NotificationsContext` emits when a `travelUpdate` event arrives |
| `notificationsSync.js` | `fetchUserNotifications` — loads notifications from API |
| `chatSync.js` | `loadChatHistory`, `sendChatTurn` — sync chat messages |
| `wishlistSync.js` | `pushLocalSavedDestinations`, `fetchSavedDestinationSlugs` — sync wishlist on login |
| `travelPreferencesSync.js` | `loadPreferences`, `savePreferences` — sync travel preferences |

---

## Hooks (`client/src/hooks/`)

| File | Purpose |
|------|---------|
| `useAdminRealtimeRefresh.js` | Subscribes to `travelUpdateBus`; when a SignalR `travelUpdate` arrives and user is Admin, re-runs `hydrateFromApi` on all admin stores — **this is the live dashboard refresh** |
| `useAdminUsers.js` | Manages admin user table state (search term, selected, actions) |
| `useCountUp.js` | Animates a number from 0 to target over a duration — used in `TrustStats` |

---

## Contexts (`client/src/context/`)

### `ToastContext.jsx`
Global toast/snackbar. Any component can call `const { showToast } = useToast()` and call `showToast({ message, severity })`.

### `NotificationsContext.jsx`
- On auth change: connects to SignalR `/hubs/notifications` hub
- On `travelUpdate` event: adds live notification to local list, shows toast, emits on `travelUpdateBus`
- On logout: disconnects hub
- Provides `{ items, loading, connected, markRead, refresh }` to all children
- The `connected` flag drives the live indicator dot on the notification bell

---

## Key utility files (`client/src/utils/`)

### `advancedSearch.js`
Core of the client-side search feature. Used on all admin list pages and the user bookings dashboard.

```javascript
applyAdvancedListQuery({
  items,             // raw array
  query,             // search string from input
  getSearchableText, // (item) => string — what fields to search
  sortKey,           // e.g. "id-desc"
  sortDir,           // "asc" | "desc"
  getSortValue,      // (item, sortKey) => value
  predicate,         // extra filter function
})
```

- `normalizeSearchText` — lowercases + strips diacritics (works for names like "Ëlona" matching "elona")
- `tokenizeQuery` — splits query into tokens; all tokens must match (AND logic)
- `compareValues` — type-aware: string (`localeCompare`), number, date

### `reportGenerator.js`
- `buildReportRows(type, data, criteria)` — filters and formats rows for a report type
- `downloadCsv(filename, rows)` — triggers client-side CSV file download
- `openPrintReport(title, rows, criteria)` — builds printable HTML and opens in new tab
- `REPORT_TYPES` — catalog of available report types

### `dataExchangeClient.js`
- `triggerBlobDownload(blob, filename)` — creates a URL for a Blob and auto-clicks an anchor
- `parseImportJsonFile(file)` — reads a File object, parses JSON, normalises to array
- `formatImportResultMessage(body)` — turns `{ inserted: 5 }` into "Imported 5 row(s)."

### `paymentGateway.js`
Used as offline/guest fallback only. Implements Luhn check, card validation, and a simulated payment response. **Not used when the user is authenticated and the server is reachable.**

### `mlPersonalization.js`
`getPersonalizedRecommendations(signals)` — scores destinations based on user's booking history, saved destinations, and recent searches. Pure client-side heuristic.

### `mlPredictive.js`
- `predictWeeklyBookings(bookings)` — linear trend from historical data
- `predictRevenue(bookings)` — next-month revenue estimate
- `predictChurnRisk(users)` — flags users with no recent activity
- `generateMlInsights(bookings, trips, users)` — combines all into dashboard insights panel

### `mlVision.js`
`analyzeTravelImage(file)` — sends image to `POST /api/v1/destinations` (or a vision endpoint); extracts destination/mood tags. Used in `VisionUploadAnalyzer` on the explore page.

---

## Routing (`client/src/router.jsx`)

All pages are lazy-loaded (`React.lazy`). The router is created with `createBrowserRouter`.

| Path | Component | Layout |
|------|-----------|--------|
| `/` | `HomePage` | Main |
| `/explore` | `SearchPage` | Main |
| `/destination/:id` | `DestinationDetailPage` | Main |
| `/itinerary` | `ItineraryPlannerPage` | Main |
| `/booking` | `BookingPage` | Main |
| `/bookings` | `BookingsDashboardPage` | Main |
| `/bookings/:bookingId` | `BookingDetailsPage` | Main |
| `/bookings/:bookingId/traveler` | `BookingTravelerPage` | Main |
| `/bookings/:bookingId/success` | `BookingSuccessPage` | Main |
| `/contact` | `ContactPage` | Main |
| `/assistant` | `AiAssistantPage` | Main |
| `/notifications` | `NotificationsPage` | Main |
| `/login` | `LoginPage` | Auth |
| `/register` | `RegisterPage` | Auth |
| `/admin` | `AdminDashboardPage` | Admin |
| `/admin/trips` | `AdminTripsPage` | Admin |
| `/admin/bookings` | `AdminBookingsPage` | Admin |
| `/admin/users` | `AdminUsersPage` | Admin |
| `/admin/reports` | `AdminReportsPage` | Admin |
| `/admin/data` | `AdminDataExchangePage` | Admin |
| `/admin/settings` | `AdminSettingsPage` | Admin |

---

## Vite configuration

`client/vite.config.js`:
- Dev server proxy: `/api` and `/hubs` proxied to `http://localhost:5161` (gateway) — so the frontend never needs to know individual service ports
- `target: "esnext"` build
- Source maps in dev

---

## CI pipeline

`.github/workflows/client-ci.yml` runs on every PR touching `client/`:
1. `npm ci`
2. `npm run lint` (ESLint)
3. `npm run build` (Vite production build)

Build artifacts are not deployed automatically — this pipeline only validates the code.
