// Thin wrapper around localStorage.
// Every call is wrapped in try/catch because storage can be unavailable
// (private browsing, blocked cookies) or contain corrupted JSON.

const PREFIX = 'shopsphere:';

export function loadState(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage is full or unavailable: the app keeps working, it just will not persist.
  }
}

export function removeState(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

/** Wipes everything this app stored (handy while developing). */
export function clearAllState() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}
