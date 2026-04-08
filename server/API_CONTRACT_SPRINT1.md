# API Contract Draft - Sprint 1

Base route convention:
- `/api/v1/...`

Auth:
- JWT Bearer token in `Authorization: Bearer <token>`

Error format (recommended):
- `{ "error": "message", "code": "OPTIONAL_CODE", "details": [] }`

---

## 1) Authentication and Users (UserService)

### POST `/api/v1/auth/register`
- Auth: Public
- Body:
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john@example.com",
  "password": "P@ssw0rd123!"
}
```
- 200:
```json
{
  "accessToken": "jwt",
  "refreshToken": "refresh-token",
  "expiresAtUtc": "2026-04-08T19:00:00Z"
}
```
- 400: validation error / duplicate email

### POST `/api/v1/auth/login`
- Auth: Public
- Body:
```json
{
  "email": "john@example.com",
  "password": "P@ssw0rd123!"
}
```
- 200: same response as register
- 401: invalid credentials

### POST `/api/v1/auth/refresh`
- Auth: Public
- Body:
```json
{
  "refreshToken": "token"
}
```
- 200: new access + refresh token
- 401: invalid/revoked/expired refresh token

### POST `/api/v1/auth/logout`
- Auth: Bearer
- Body:
```json
{
  "refreshToken": "token"
}
```
- 204: token revoked
- 401: unauthorized

### GET `/api/v1/users/me`
- Auth: Bearer
- 200:
```json
{
  "id": 1,
  "name": "John",
  "surname": "Doe",
  "email": "john@example.com",
  "role": "Traveler"
}
```

### PUT `/api/v1/users/me`
- Auth: Bearer
- Body:
```json
{
  "name": "John",
  "surname": "Doe"
}
```
- 200: updated user profile

---

## 2) Itineraries (ItineraryService)

### POST `/api/v1/itineraries/generate`
- Auth: Bearer
- Body:
```json
{
  "destination": "Rome",
  "startDate": "2026-06-10",
  "endDate": "2026-06-14",
  "budgetLevel": "medium",
  "transportMode": "public"
}
```
- 201:
```json
{
  "id": 101,
  "userId": 1,
  "destination": "Rome",
  "days": [
    {
      "day": 1,
      "activities": ["Colosseum", "Roman Forum"],
      "transport": "Metro",
      "meals": ["Lunch near Colosseum"]
    }
  ]
}
```

### GET `/api/v1/itineraries/{id}`
- Auth: Bearer
- 200: itinerary
- 404: not found

### GET `/api/v1/itineraries/user/{userId}`
- Auth: Bearer (self/admin)
- 200: list of itineraries

---

## 3) Bookings (BookingService)

### POST `/api/v1/bookings`
- Auth: Bearer
- Body:
```json
{
  "itineraryId": 101,
  "provider": "HotelProviderX",
  "bookingType": "Hotel",
  "referenceCode": "HPX-99122",
  "amount": 350.00,
  "currency": "EUR"
}
```
- 201: created booking

### GET `/api/v1/bookings/{id}`
- Auth: Bearer (self/admin)
- 200: booking details

### PATCH `/api/v1/bookings/{id}/status`
- Auth: Bearer (Admin/Support/System)
- Body:
```json
{
  "status": "Confirmed"
}
```
- 200: updated booking status

---

## 4) Payments (PaymentService)

### POST `/api/v1/payments/checkout`
- Auth: Bearer
- Body:
```json
{
  "bookingId": 501,
  "paymentProvider": "Stripe",
  "successUrl": "https://app/success",
  "cancelUrl": "https://app/cancel"
}
```
- 200:
```json
{
  "paymentId": "pay_123",
  "checkoutUrl": "https://checkout.provider.com/session/abc"
}
```

### POST `/api/v1/payments/webhook`
- Auth: Provider signature verification
- Body: provider event payload
- 200: processed
- 400: invalid signature

### GET `/api/v1/payments/{paymentId}`
- Auth: Bearer (self/admin)
- 200: payment status and metadata

---

## 5) Notifications and Real-Time

### POST `/api/v1/notifications/broadcast`
- Service: NotificationService
- Auth: Bearer (Admin)
- Body:
```json
{
  "title": "Flight Delay",
  "message": "Flight AZ203 delayed by 45 minutes.",
  "type": "FlightUpdate"
}
```
- 202: accepted and dispatched

### GET `/api/v1/notifications/user/{userId}`
- Auth: Bearer (self/admin)
- 200: user notifications list

### PATCH `/api/v1/notifications/{id}/read`
- Auth: Bearer (self/admin)
- 200: marked as read

### SignalR Hub `/hubs/notifications`
- Auth: Bearer (recommended)
- Event name:
  - `travelUpdate`
- Sample payload:
```json
{
  "title": "Weather Alert",
  "message": "Heavy rain expected at destination",
  "type": "Weather",
  "sentAtUtc": "2026-04-08T20:00:00Z"
}
```

---

## 6) Advanced Search (Feature Requirement)

At least 5 searchable lists:
- users
- itineraries
- bookings
- payments
- notifications

Pattern:
- `GET /api/v1/search/{entity}?q=&page=1&pageSize=20&sortBy=&sortOrder=asc&filters...`

Example:
- `GET /api/v1/search/bookings?q=rome&status=Confirmed&from=2026-06-01&to=2026-06-30&page=1&pageSize=20`

---

## 7) Export/Import (Feature Requirement)

### Export
- `POST /api/v1/export/{entity}?format=csv|xlsx|json`
- Auth: Bearer (Admin/Support)
- Body:
```json
{
  "filters": {
    "status": "Confirmed"
  }
}
```
- 200: file stream/download

### Import
- `POST /api/v1/import/{entity}?format=csv|xlsx|json`
- Auth: Bearer (Admin)
- Body: multipart file upload
- 200:
```json
{
  "processed": 100,
  "succeeded": 96,
  "failed": 4,
  "errors": [
    { "row": 5, "message": "Invalid email" }
  ]
}
```

---

## 8) Role Matrix (Initial)

- Traveler:
  - Own profile
  - Own itineraries/bookings/payments/notifications
- Support:
  - Read user-facing issues, limited operational actions
- Admin:
  - Broadcast notifications
  - Access reports/export/import
  - Manage users and system settings

