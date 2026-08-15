/**
 * Kettle & Co — Analytics API
 *
 * A small Express backend that stands in for a real order-service.
 * It generates a year of synthetic order records once at startup
 * (think: "the database"), then exposes endpoints that filter and
 * aggregate those records on request — exactly what a production
 * service backed by a real DB would do with a SQL GROUP BY.
 *
 * Run:
 *   cd backend
 *   npm install
 *   node server.js
 *
 * API listens on http://localhost:3001
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------
// "Database" — category catalog + generated order rows
// ---------------------------------------------------------------

const CATEGORIES = [
  { key: 'green',  label: 'Green Tea',    color: '#8fa98a', price: [9, 16] },
  { key: 'black',  label: 'Black Tea',    color: '#a8674f', price: [8, 15] },
  { key: 'herbal', label: 'Herbal Blend', color: '#c97064', price: [10, 18] },
  { key: 'oolong', label: 'Oolong',       color: '#d4a24c', price: [14, 24] },
  { key: 'white',  label: 'White Tea',    color: '#b9afc9', price: [16, 28] },
];

function generateOrders() {
  const orders = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let id = 1;

  for (let d = 364; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const weekday = date.getDay(); // 0 Sun ... 6 Sat
    const isWeekend = weekday === 0 || weekday === 6;

    // colder months -> more tea
    const monthBoost = [1.3, 1.15, 1, 0.9, 0.85, 0.8, 0.85, 0.9, 1, 1.15, 1.25, 1.4][date.getMonth()];
    const baseCount = (isWeekend ? 9 : 6) * monthBoost;
    const numOrders = Math.max(0, Math.round(baseCount + (Math.random() * 4 - 2)));

    for (let i = 0; i < numOrders; i++) {
      const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const [lo, hi] = cat.price;
      const unitPrice = lo + Math.random() * (hi - lo);
      const qty = 1 + Math.floor(Math.random() * 3);
      orders.push({
        id: id++,
        date: date.toISOString().slice(0, 10),
        weekday,
        category: cat.key,
        revenue: Math.round(unitPrice * qty * 100) / 100,
      });
    }
  }
  return orders;
}

const ORDERS = generateOrders();

// ---------------------------------------------------------------
// Aggregation helpers (server-side)
// ---------------------------------------------------------------

function categoryMeta(key) {
  const c = CATEGORIES.find((c) => c.key === key);
  return c ? { key: c.key, label: c.label, color: c.color } : null;
}

function aggregateStats(orders) {
  const totalRevenue = orders.reduce((s, o) => s + o.revenue, 0);
  const totalOrders = orders.length;
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;

  const byCat = {};
  orders.forEach((o) => { byCat[o.category] = (byCat[o.category] || 0) + o.revenue; });
  const topKey = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a])[0];

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    avgOrder: Math.round(avgOrder * 100) / 100,
    topCategory: topKey ? categoryMeta(topKey) : null,
  };
}

function aggregateTrend(orders) {
  const byDate = {};
  orders.forEach((o) => { byDate[o.date] = (byDate[o.date] || 0) + o.revenue; });
  const dates = Object.keys(byDate).sort();

  // bucket into ~24 points so the line stays readable over long ranges
  const bucketSize = Math.max(1, Math.ceil(dates.length / 24));
  const labels = [];
  const values = [];
  for (let i = 0; i < dates.length; i += bucketSize) {
    const slice = dates.slice(i, i + bucketSize);
    const sum = slice.reduce((s, d) => s + byDate[d], 0);
    labels.push(slice[0].slice(5));
    values.push(Math.round(sum));
  }
  return { labels, values };
}

function aggregateByCategory(orders) {
  const byCat = {};
  CATEGORIES.forEach((c) => { byCat[c.key] = 0; });
  orders.forEach((o) => { byCat[o.category] += o.revenue; });
  return CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    color: c.color,
    revenue: Math.round(byCat[c.key]),
  }));
}

function aggregateByWeekday(orders) {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  orders.forEach((o) => { counts[o.weekday]++; });
  return counts;
}

function aggregateCategoryBar(orders) {
  const counts = {};
  const revenue = {};
  CATEGORIES.forEach((c) => { counts[c.key] = 0; revenue[c.key] = 0; });
  orders.forEach((o) => { counts[o.category]++; revenue[o.category] += o.revenue; });
  return CATEGORIES
    .map((c) => ({
      key: c.key,
      label: c.label,
      color: c.color,
      orders: counts[c.key],
      avgValue: counts[c.key] ? Math.round((revenue[c.key] / counts[c.key]) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.orders - a.orders);
}

// ---------------------------------------------------------------
// Routes
// ---------------------------------------------------------------

// GET /api/categories — category catalog, used to build the filter chips
app.get('/api/categories', (req, res) => {
  res.json(CATEGORIES.map(({ key, label, color }) => ({ key, label, color })));
});

// GET /api/dashboard?days=30&categories=green,black
// Returns server-aggregated data for every chart + stat card in one call.
app.get('/api/dashboard', (req, res) => {
  const days = Math.max(1, parseInt(req.query.days, 10) || 30);

  const validKeys = CATEGORIES.map((c) => c.key);
  const requested = typeof req.query.categories === 'string' && req.query.categories.length
    ? req.query.categories.split(',').filter((k) => validKeys.includes(k))
    : validKeys;
  const activeCategories = requested.length ? requested : validKeys;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const filtered = ORDERS.filter(
    (o) => o.date >= cutoffStr && activeCategories.includes(o.category)
  );

  res.json({
    rangeDays: days,
    activeCategories,
    stats: aggregateStats(filtered),
    trend: aggregateTrend(filtered),
    byCategory: aggregateByCategory(filtered),
    byWeekday: aggregateByWeekday(filtered),
    categoryBar: aggregateCategoryBar(filtered),
  });
});

app.get('/', (req, res) => {
  res.send('Kettle & Co Analytics API — see /api/categories and /api/dashboard');
});

app.listen(PORT, () => {
  console.log(`Kettle & Co Analytics API running at http://localhost:${PORT}`);
});
