import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/** Runs when no route matched the request. */
export function notFound(req, res, next) {
  next(new ApiError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

/** Last middleware in the chain: every error ends up here and becomes a JSON response. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;
  let errors = err.errors;

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'The request body is not valid JSON';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'The request body is too large';
  } else if (err.name === 'ValidationError' && err.errors) {
    // Mongoose schema validation
    status = 400;
    errors = Object.fromEntries(Object.entries(err.errors).map(([field, detail]) => [field, detail.message]));
    message = Object.values(errors)[0];
  } else if (err.code === 11000) {
    status = 409;
    message = 'That value is already in use';
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for "${err.path}"`;
  }

  if (status >= 500) {
    console.error(err);
    if (env.isProd) message = 'Something went wrong on the server';
  }

  res.status(status).json({ message, ...(errors ? { errors } : {}) });
}
