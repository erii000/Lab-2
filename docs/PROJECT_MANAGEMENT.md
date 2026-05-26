# Project management (course requirement)

Use **GitHub Projects**, **Jira**, or **Trello** with these columns:

- **To Do**
- **In Progress**
- **Done**

## Setup (GitHub Projects)

1. Repository → **Projects** → **New project** → Board template.
2. Import tasks from [`server/TEAM_BACKLOG_SPLIT.md`](../server/TEAM_BACKLOG_SPLIT.md).
3. For each card set:
   - **Assignee** (team member)
   - **Due date**
   - **Acceptance criteria** (from backlog)

## Suggested ownership (from backlog)

| Member | Focus |
|--------|--------|
| A | JWT, gateway, CORS, users, README lead |
| B | Itineraries, destinations, ERD lead |
| C | Bookings, payments, Docker, import/export |

## Reviewer access

Invite **elton.boshnjaku@ubt-uni.net** as collaborator on the GitHub repository (Settings → Collaborators).

## Demo: data exchange UI

Admin → **Data exchange** (`/admin/data`) exports/imports all five API lists (JSON, CSV, Excel export; JSON import). Per-list bars also appear on Users, Bookings, and Trips admin pages.

## Definition of Done (team)

- Code merged to `main` with descriptive commit message
- Swagger/Postman route tested
- No secrets in git (use `global-settings.env` locally only)
