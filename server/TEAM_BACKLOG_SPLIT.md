# Team Backlog Split (3 Teammates)

This backlog is ready to import into Jira/Trello/GitHub Projects.

Board columns:

- To Do
- In Progress
- Done

Required fields per card:

- Owner (A, B, or C)
- Deadline
- Acceptance Criteria

---

## Member A (Security, Gateway, User Service)

1. Setup JWT access token configuration in `UserService`

- Owner: A
- Priority: High
- Acceptance:
  - Access tokens generated with issuer/audience/expiry from config
  - Secret read from environment variables
  - Swagger auth button works

2. Implement refresh token rotation

- Owner: A
- Priority: High
- Acceptance:
  - `POST /api/v1/auth/refresh` rotates token
  - Old refresh token marked revoked
  - Invalid/expired refresh token returns 401

3. Implement user registration endpoint

- Owner: A
- Priority: High
- Acceptance:
  - `POST /api/v1/auth/register` stores hashed password
  - Duplicate email rejected with 400
  - DTO validation applied

4. Implement login endpoint

- Owner: A
- Priority: High
- Acceptance:
  - `POST /api/v1/auth/login` returns access + refresh token
  - Wrong credentials return 401

5. Configure role-based authorization policies

- Owner: A
- Priority: High
- Acceptance:
  - Roles: `Admin`, `Traveler`, `Support`
  - Sensitive routes protected via `[Authorize(Roles=...)]`

6. Implement `GET /api/v1/users/me`

- Owner: A
- Priority: Medium
- Acceptance:
  - Returns current user profile
  - Requires authenticated JWT

7. Implement `PUT /api/v1/users/me`

- Owner: A
- Priority: Medium
- Acceptance:
  - Validates update payload
  - Persists profile edits

8. Implement admin list endpoint `GET /api/v1/users`

- Owner: A
- Priority: Medium
- Acceptance:
  - Paging + filtering by email/role/status
  - Admin-only access

9. API Gateway route forwarding baseline

- Owner: A
- Priority: High
- Acceptance:
  - Gateway routes to User, Notification, Itinerary services
  - Health endpoint for each upstream

10. CORS hardening

- Owner: A
- Priority: High
- Acceptance:
  - Only allowed origins configured
  - No wildcard origin in production

11. Security middleware + global exception format

- Owner: A
- Priority: Medium
- Acceptance:
  - Unified error response schema
  - Unauthorized/forbidden handled consistently

12. Auth Swagger/OpenAPI documentation

- Owner: A
- Priority: Medium
- Acceptance:
  - Request/response examples for register/login/refresh
  - Security scheme documented

---

## Member B (Itinerary, Booking, Payment, Integrations)

13. Create itinerary domain models and repository

- Owner: B
- Priority: High
- Acceptance:
  - Itinerary + itinerary items modeled in MSSQL
  - Repository methods for create/get/update

14. Implement itinerary generation service

- Owner: B
- Priority: High
- Acceptance:
  - `POST /api/v1/itineraries/generate` creates day-by-day plan
  - Uses user preferences + destination + date range

15. Implement itinerary query endpoints

- Owner: B
- Priority: Medium
- Acceptance:
  - `GET /api/v1/itineraries/{id}`
  - `GET /api/v1/itineraries/user/{userId}`

16. Implement booking creation flow

- Owner: B
- Priority: High
- Acceptance:
  - `POST /api/v1/bookings` creates booking linked to itinerary
  - Validation for required fields

17. Implement booking status transitions

- Owner: B
- Priority: Medium
- Acceptance:
  - `PATCH /api/v1/bookings/{id}/status`
  - Valid transitions only

18. Setup payment provider integration (Stripe/PayPal)

- Owner: B
- Priority: High
- Acceptance:
  - Checkout session/payment intent created
  - Keys read from env vars

19. Implement payment webhook handling

- Owner: B
- Priority: High
- Acceptance:
  - `POST /api/v1/payments/webhook`
  - Signature verification
  - Idempotent processing

20. Implement payment query endpoints

- Owner: B
- Priority: Medium
- Acceptance:
  - `GET /api/v1/payments/{paymentId}`
  - `GET /api/v1/payments/user/{userId}`

21. Integrate weather external API client

- Owner: B
- Priority: Medium
- Acceptance:
  - Current + forecast fetch methods
  - Retry and timeout policy

22. Integrate flight status API client

- Owner: B
- Priority: Medium
- Acceptance:
  - Status retrieval by flight number
  - Error handling for provider failures

23. Integrate transport options API client

- Owner: B
- Priority: Medium
- Acceptance:
  - Uber/public transport options endpoint
  - Estimated time and price normalized

24. Payment logs persistence

- Owner: B
- Priority: Medium
- Acceptance:
  - Transaction logs persisted (MSSQL or MongoDB)
  - Failure reason retained

---

## Member C (Real-Time, Notifications, Search, Import/Export, Audit)

25. Setup SignalR notification hub

- Owner: C
- Priority: High
- Acceptance:
  - Hub endpoint exposed at `/hubs/notifications`
  - Connected clients receive test broadcast

26. Implement notification publish service

- Owner: C
- Priority: High
- Acceptance:
  - In-app notification dispatched on booking/payment/flight changes
  - Notification type and timestamp included

27. Implement `POST /api/v1/notifications/broadcast`

- Owner: C
- Priority: Medium
- Acceptance:
  - Admin-only route
  - Broadcast reaches all connected clients

28. Implement user notification endpoints

- Owner: C
- Priority: Medium
- Acceptance:
  - `GET /api/v1/notifications/user/{userId}`
  - `PATCH /api/v1/notifications/{id}/read`

29. Implement advanced search (users list)

- Owner: C
- Priority: High
- Acceptance:
  - Filters + sorting + pagination + text search

30. Implement advanced search (itineraries list)

- Owner: C
- Priority: High
- Acceptance:
  - Destination/date/status filters + text search

31. Implement advanced search (bookings list)

- Owner: C
- Priority: High
- Acceptance:
  - Status/provider/date filters + sorting

32. Implement advanced search (payments list)

- Owner: C
- Priority: High
- Acceptance:
  - Status/method/date/amount filters + sorting

33. Implement advanced search (notifications list)

- Owner: C
- Priority: High
- Acceptance:
  - Type/read-state/date filters + text search

34. Implement export APIs (CSV/Excel/JSON) for 5 lists

- Owner: C
- Priority: High
- Acceptance:
  - Endpoint supports `format=csv|xlsx|json`
  - At least users, itineraries, bookings, payments, notifications

35. Implement import APIs (CSV/Excel/JSON) for 5 lists

- Owner: C
- Priority: High
- Acceptance:
  - Batch validation and error report per row
  - No partial corruption on failure

36. Implement audit log service

- Owner: C
- Priority: Medium
- Acceptance:
  - Write audit entries for auth, booking, payment, admin actions
  - Query endpoint for admin audits

---

## Cross-Team Tasks

37. Final README with setup/run instructions

- Owner: A+B+C (A lead)
- Priority: High
- Acceptance:
  - Local setup, env vars, migrations, run commands documented

38. OpenAPI completion and Postman collection

- Owner: A+B+C (B lead)
- Priority: High
- Acceptance:
  - All endpoints documented with examples and status codes

39. ERD update for final schema

- Owner: B+C (B lead)
- Priority: Medium
- Acceptance:
  - Tables and relationships match implemented DB

40. Docker compose for local microservice stack

- Owner: A+B+C (C lead)
- Priority: High
- Acceptance:
  - Gateway + key services + MSSQL + Redis + MongoDB boot together

Database Ownership Map (Microservices)

User Service: (erioni)
Users
RefreshTokens
Roles
Permissions
UserRoles
RolePermissions
TravelPreferences
EmergencyContacts

ItineraryService: (almira)
Itineraries
Trips
TripDestinations
TripParticipants
Destinations
Wishlists (optional: could be RecommendationsService if you create one)

BookingService: (almira)
Bookings
Hotels
Flights
TransportOptions
SavedTrips (optional: can stay in ItineraryService depending on flow)

PaymentService: (almira)
Payments
Expenses

NotificationService: (doni)
Notifications

RealTimeCommunicationService (doni)
ChatMessages (if chat is real-time module)

WeatherExternalDataService: (doni)
WeatherData

SupportService: (doni)  
SupportTickets

AuditService: (doni)
AuditLogs
