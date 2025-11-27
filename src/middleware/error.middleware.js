// src/middleware/error.middleware.js
const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  // Normalisasi error
  const status = err.status || err.statusCode || 500;
  const code = err.code || err.name || 'INTERNAL_ERROR';
  const message = err.publicMessage || err.message || 'Terjadi kesalahan pada server';

  // Log stack trace (sensitive) ke logger internal
  logger.error({
    message: message,
    code,
    status,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    user: req.user ? { id: req.user.id, role: req.user.role } : null,
    ip: req.ip
  });

  // Jika response formatter ada (res.error), pakai itu agar konsisten
  if (res && typeof res.error === 'function') {
    // Jangan kirim stack trace ke client, hanya message/code/status
    return res.error(message, code, status);
  }

  // Fallback JSON
  res.status(status).json({
    success: false,
    message,
    error: code
  });
};