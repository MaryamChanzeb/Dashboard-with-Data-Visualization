# ☕ Kettle & Co Analytics Dashboard

A responsive analytics dashboard for **Kettle & Co** that transforms order data into interactive visualizations and business insights.

The project includes a frontend dashboard and a Node.js backend API. The backend generates synthetic order data and performs server-side aggregation, while the frontend displays the results through interactive charts, statistics, and filters.

## ✨ Features

* 📊 Interactive analytics dashboard
* 💰 Total revenue statistics
* 🧾 Total orders statistics
* 📈 Average order value
* 🏆 Top-performing category
* 📉 Revenue trend line chart
* 📊 Category comparison bar chart
* 🥧 Category revenue visualization
* 📅 Dynamic date-range filtering
* 🏷️ Category filtering
* 🔄 Dashboard updates dynamically from backend data
* 📱 Responsive layout for desktop, tablet, and mobile
* ⚡ Server-side data aggregation
* 🔌 REST API integration

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js

### Backend

* Node.js
* Express.js
* REST API

### Data

* Synthetic order dataset
* Server-side aggregation

## 📁 Project Structure

```text
kettle-co-analytics/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── dashboard.html
└── README.md
```

> The exact frontend file names may vary depending on the implementation.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd kettle-co-analytics
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Start the backend

```bash
node server.js
```

The API will run at:

```text
http://localhost:3001
```

### 4. Open the dashboard

Keep the backend running and open:

```text
dashboard.html
```

in your browser.

The dashboard will fetch its analytics data from the backend API.

## 🔌 API Endpoints

### Get Categories

```http
GET /api/categories
```

Returns the available categories used by the dashboard filters.

Example response:

```json
[
  {
    "key": "green",
    "label": "Green Tea",
    "color": "#8fa98a"
  }
]
```

### Get Dashboard Data

```http
GET /api/dashboard
```

Returns all data required by the dashboard.

#### Query Parameters

| Parameter    | Description                        | Example       |
| ------------ | ---------------------------------- | ------------- |
| `days`       | Number of previous days to include | `30`          |
| `categories` | Comma-separated category keys      | `green,black` |

Example:

```http
GET /api/dashboard?days=30&categories=green,black
```

Example response:

```json
{
  "rangeDays": 30,
  "activeCategories": ["green", "black"],
  "stats": {
    "totalRevenue": 1669.27,
    "totalOrders": 71,
    "avgOrder": 23.51,
    "topCategory": {}
  },
  "trend": {
    "labels": [],
    "values": []
  },
  "byCategory": [],
  "byWeekday": [],
  "categoryBar": []
}
```

## 📊 Dashboard Visualizations

The dashboard uses backend-generated data to display multiple visualizations.

### Revenue Trend

Displays revenue changes across the selected date range.

### Category Revenue

Shows how total revenue is distributed across different tea categories.

### Category Orders

Compares the number of orders and average order value for each category.

### Statistics Cards

The dashboard displays key metrics including:

* Total Revenue
* Total Orders
* Average Order Value
* Top Category

## 🎛️ Interactive Filters

Users can filter the dashboard using:

### Date Range

Available examples:

* Last 7 days
* Last 30 days
* Last 90 days
* Last 365 days

### Categories

Users can select one or multiple product categories.

Whenever a filter changes, the dashboard requests updated data from:

```text
/api/dashboard
```

and refreshes the statistics and charts.

## 🔄 Data Flow

```text
Synthetic Order Data
        ↓
   Node.js Backend
        ↓
Server-side Aggregation
        ↓
   REST API
        ↓
 Dashboard JavaScript
        ↓
 Charts + Statistics
        ↓
 Interactive Filters
```

## 🧮 Server-Side Aggregation

The backend aggregates raw order records before sending them to the frontend.

The following aggregation functions are used:

```text
aggregateStats()
aggregateTrend()
aggregateByCategory()
aggregateByWeekday()
aggregateCategoryBar()
```

This keeps the frontend lightweight and ensures that the dashboard receives already-processed analytics data.

## 🗄️ Using Real Data

The current backend generates synthetic order records using:

```javascript
generateOrders()
```

For production use, replace this function with a database query against the actual orders table.

The aggregation functions expect order records in the following structure:

```javascript
{
  date,
  weekday,
  category,
  revenue
}
```

Therefore, the existing aggregation logic can continue to be used after replacing the synthetic data source.

## ⚠️ Important

The current dataset is **synthetic/demo data** generated when the backend starts.

It is intended for demonstrating:

* Dashboard development
* Data visualization
* API integration
* Filtering
* Server-side aggregation

It is not real Kettle & Co business data.

## 🐛 Troubleshooting

### Dashboard shows no data

Make sure the backend is running:

```bash
node server.js
```

and verify that:

```text
http://localhost:3001/api/dashboard
```

returns JSON data.

### CORS or connection error

Make sure the frontend is requesting the correct backend URL:

```text
http://localhost:3001
```

### Port already in use

If port `3001` is already being used, stop the existing process or configure the backend to use another available port and update the frontend API URL accordingly.

## 🔮 Future Improvements

* Connect to a real database
* Add authentication
* Add export to CSV/PDF
* Add more advanced date ranges
* Add real-time analytics
* Add product-level analytics
* Add sales forecasting
* Add dark/light theme
* Deploy frontend and backend separately

## 📄 License

This project is created for educational and portfolio purposes.
