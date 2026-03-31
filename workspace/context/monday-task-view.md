# Monday Task View

**Path:** `A:\Apps\monday-task-view\`
**Live URL:** `https://monday-task-view.fly.dev/`
**Board:** AdminTest (`18406073661`) — Lightwave Solar CRM
**Monday Account:** Lightwave Solar (second key in master env)

---

## What It Is

A custom Monday.com Board View app (React + Vite) that shows ALL subitems across all parent items in a single flat filterable table. Normally Monday nests subitems under each record — this surfaces them all in one place.

## Features

- Flat table of all subitems with: Task, ↗ Open, Parent Project, Phone, Email, Assigned To, Status, Due Date
- **↗ Open** — opens the parent item's detail panel inside Monday via `monday.execute('openItemCard')`
- **Inline editing:** Task name (text), Status (dropdown), Due Date (calendar input)
- **Filters:** Search by task name, assignee, status, due date range
- **Auto-filter:** On load, queries `{ me { name } }` to get current user and pre-filters to their tasks
- **Phone:** clickable `tel:` link
- **Email:** opens Outlook web compose (`outlook.office.com/mail/deeplink/compose?to=...`)

## Tech Stack

- React + Vite + TanStack Table
- `monday-sdk-js` for `openItemCard` execute
- nginx on Fly.io serving the static build
- Direct GraphQL API calls with hardcoded Lightwave API key

## Subitem Column IDs

- `person` — Assigned To
- `status` — Status
- `date0` — Due Date

## Parent Column IDs (fetched for each subitem)

- `lead_phone` — Phone
- `lead_email` — Email

## How to Add to a Monday Board

1. Go to `monday.com/developers/apps` → create app with slug `monday-task-view`
2. Add Board View feature → set URL to `https://monday-task-view.fly.dev/`
3. Promote to live → Install on workspace
4. On the board, click **+** → Apps → select your app

## Deploy

```
cd A:\Apps\monday-task-view
npm run build  # local test only (Docker builds in Fly)
flyctl deploy
```
