require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Respond immediately for Render health checks (before DB is ready)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'vaikhanasa-nidhi-api' });
});

const defaultOrigin = 'http://localhost:5173';
const allowedOrigins = (process.env.CLIENT_ORIGIN || defaultOrigin)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const capacitorOrigins = new Set([
  'https://localhost',
  'http://localhost',
  'capacitor://localhost',
]);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (capacitorOrigins.has(origin)) return true;
  // Vite may use 5174, 5175, etc. when 5173 is busy
  if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
    return true;
  }
  return false;
}

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
