// Error with an HTTP status, thrown by services/controllers and turned into
// a JSON response by middlewares/errorHandler.js
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details; // e.g. { field: 'message' } for form errors
  }
}

const badRequest = (message, details) => new HttpError(400, message, details);
const unauthorized = (message = 'Authentification requise') => new HttpError(401, message);
const forbidden = (message = "Vous n'avez pas accès à cette ressource") => new HttpError(403, message);
const notFound = (message = 'Ressource introuvable') => new HttpError(404, message);
const conflict = (message, details) => new HttpError(409, message, details);

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict };
