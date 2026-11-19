// Protects against NoSQL operator injection.
// A request body such as { "email": { "$gt": "" } } would match every user if it
// reached a MongoDB query untouched, so any key that starts with "$" or contains
// "." is removed from the body, query string and URL parameters.

function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      result[key] = clean(child);
    }
    return result;
  }
  return value;
}

export function sanitize(req, res, next) {
  if (req.body) req.body = clean(req.body);
  if (req.query) req.query = clean(req.query);
  if (req.params) req.params = clean(req.params);
  next();
}
