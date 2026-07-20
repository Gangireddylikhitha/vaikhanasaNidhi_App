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

const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  // Local dev — allow any origin (Vite ports, 127.0.0.1, LAN IP, etc.)
  app.use(cors({ origin: true, credentials: true }));
} else {
  const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://localhost:5173',
    'https://127.0.0.1:5173',
    'https://www.vaikhanasanidhi.com',
    'https://vaikhanasanidhi.com',
  ];
  const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

  const capacitorOrigins = new Set([
    'https://localhost',
    'http://localhost',
    'capacitor://localhost',
  ]);

  function normalizeOrigin(origin) {
    if (!origin) return '';
    return origin.endsWith('/') ? origin.slice(0, -1) : origin;
  }

  function isAllowedOrigin(origin) {
    if (!origin) return true;
    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) return true;
    if (capacitorOrigins.has(normalizedOrigin)) return true;
    return false;
  }

  app.use(cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
