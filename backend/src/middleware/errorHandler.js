const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

function errorHandler(err, req, res, next) {
  if (err.name === 'CastError') {
    return res.status(404).json({ error: 'Resource not found', code: 'NOT_FOUND' });
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    error: err.message || 'Something went wrong',
    code,
  });
}

module.exports = { notFound, errorHandler };
