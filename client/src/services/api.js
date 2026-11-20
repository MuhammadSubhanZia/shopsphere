// Talks to the Express / MongoDB back-end (the server/ folder) using fetch.
//
// It exports the same function names the old mock API had, so the Redux slices
// only needed a new import path. Every function returns a Promise that resolves
// with the data, or rejects with an ApiError whose `message` is safe to show to the user.

// In development Vite forwards /api to the server (see vite.config.js), so the browser
// sees one origin and the session cookie just works. When the API is hosted elsewhere,
// set VITE_API_URL (see .env.example).
const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

/** Error thrown by every API function (mirrors an HTTP error response). */
export class ApiError extends Error {
  constructor(message, status = 400, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors; // optional { field: 'message' } map from server-side validation
  }
}

// Called when a protected request comes back 401 (the session ended). The store registers it.
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

/**
 * The one place that calls fetch.
 * `credentials: 'include'` sends the httpOnly session cookie with every request.
 * `trackSession: false` is used by login/register/me, where a 401 is an expected answer.
 */
async function request(path, { method = 'GET', body, trackSession = true } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that it is running and try again.', 0);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // an empty or non-JSON body
  }

  if (!response.ok) {
    if (response.status === 401 && trackSession) unauthorizedHandler?.();
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status, data?.errors);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const getProducts = () => request('/products');

export const getProductById = (id) => request(`/products/${id}`);

export const createProduct = (data) => request('/products', { method: 'POST', body: data });

export const updateProduct = (id, changes) => request(`/products/${id}`, { method: 'PATCH', body: changes });

export async function deleteProduct(id) {
  await request(`/products/${id}`, { method: 'DELETE' });
  return Number(id);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const getCategories = () => request('/categories');

export const createCategory = (data) => request('/categories', { method: 'POST', body: data });

export const updateCategory = (id, data) => request(`/categories/${id}`, { method: 'PATCH', body: data });

export async function deleteCategory(id) {
  await request(`/categories/${id}`, { method: 'DELETE' });
  return Number(id);
}

// ---------------------------------------------------------------------------
// Authentication and users
// The session lives in an httpOnly cookie that the browser sends automatically.
// ---------------------------------------------------------------------------

export const registerUser = ({ name, email, password, phone }) =>
  request('/auth/register', { method: 'POST', body: { name, email, password, phone }, trackSession: false });

export const loginUser = ({ email, password }) =>
  request('/auth/login', { method: 'POST', body: { email, password }, trackSession: false });

export const logoutUser = () => request('/auth/logout', { method: 'POST', trackSession: false });

/** Who is logged in according to the server? Used on start-up to restore the session. */
export const getCurrentUser = () => request('/auth/me', { trackSession: false });

// The server knows who is logged in from the cookie, so the id is not needed.
// It stays in the signature so the callers did not have to change.
export const updateUserProfile = (id, changes) => request('/users/me', { method: 'PATCH', body: changes });

export const getUsers = () => request('/users');

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const getOrdersByUser = () => request('/orders/mine');

export const getAllOrders = () => request('/orders');

/**
 * Only product ids and quantities are sent for the items. The server looks up the real
 * prices and stock itself, and works out the totals.
 */
export function createOrder(payload) {
  const { userId, ...body } = payload; // the logged-in user comes from the session cookie
  return request('/orders', { method: 'POST', body });
}

export const updateOrderStatus = (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status } });

export const cancelOrder = (id) => request(`/orders/${id}/cancel`, { method: 'POST' });
