/**
 * An error that carries an HTTP status code. Throw it anywhere in a controller
 * and the error-handling middleware turns it into a JSON response.
 */
export class ApiError extends Error {
  constructor(message, status = 400, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors; // optional { field: 'message' } map for form errors
  }
}
