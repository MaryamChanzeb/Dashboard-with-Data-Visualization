# Kettle & Co Analytics API

Backend for the analytics dashboard. Generates a year of synthetic order
records at startup and serves filtered, aggregated data over HTTP.

## Run it

```bash
cd backend
npm install
node server.js
```

The API listens on `http://localhost:3001`. Keep this running while you
open `dashboard.html` — the dashboard fetches from it directly.

## Endpoints

### `GET /api/categories`
Returns the category catalog used to build the filter chips.

```json
[{ "key": "green", "label": "Green Tea", "color": "#8fa98a" }, ...]
```

### `GET /api/dashboard?days=30&categories=green,black`
Returns everything the dashboard needs in one call, already aggregated
server-side from the underlying order rows.

- `days` — how many days back to include (7, 30, 90, 365, or any integer)
- `categories` — comma-separated category keys to include; omit for all

```json
{
  "rangeDays": 30,
  "activeCategories": ["green", "black"],
  "stats": { "totalRevenue": 1669.27, "totalOrders": 71, "avgOrder": 23.51, "topCategory": {...} },
  "trend": { "labels": [...], "values": [...] },
  "byCategory": [{ "key": "green", "label": "Green Tea", "color": "#8fa98a", "revenue": 865 }, ...],
  "byWeekday": [12, 9, 15, 11, 7, 5, 12],
  "categoryBar": [{ "key": "green", "label": "Green Tea", "color": "#8fa98a", "orders": 37, "avgValue": 23.38 }, ...]
}
```

## Swapping in real data

Replace `generateOrders()` in `server.js` with a query against your actual
orders table — the aggregation functions below it (`aggregateStats`,
`aggregateTrend`, `aggregateByCategory`, `aggregateByWeekday`,
`aggregateCategoryBar`) already expect plain `{ date, weekday, category,
revenue }` rows, so nothing downstream needs to change.
