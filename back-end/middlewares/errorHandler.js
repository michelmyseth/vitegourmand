const { HttpError } = require('../utils/httpError');

// Unknown route
function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route introuvable' });
}

// Centralized error handling. Express 5 forwards errors thrown in async handlers here.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  // Invalid JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Corps de requête JSON invalide' });
  }

  // PostgreSQL constraint violations that slipped past the validation
  if (err.code === '23505') return res.status(409).json({ error: 'Cette valeur existe déjà' });
  if (err.code === '23503') return res.status(409).json({ error: 'Cet élément est utilisé ailleurs' });
  if (err.code === '23514') return res.status(400).json({ error: 'Données invalides' });

  // Unexpected error: log it, never send the details (stack, SQL) to the client
  console.error(err);
  return res.status(500).json({ error: 'Erreur interne du serveur' });
}

module.exports = { notFoundHandler, errorHandler };
