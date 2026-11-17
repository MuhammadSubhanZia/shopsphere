// Stock level helpers shared by the dashboard and the inventory page.

export const LOW_STOCK_THRESHOLD = 10;

/** 'out' (0 units) | 'low' (at or below the threshold) | 'ok' */
export function stockStatus(stock, threshold = LOW_STOCK_THRESHOLD) {
  if (stock <= 0) return 'out';
  if (stock <= threshold) return 'low';
  return 'ok';
}

// `badge` is a Bootstrap colour name used with the text-bg-* classes.
export const STOCK_META = {
  ok: { label: 'In stock', badge: 'success' },
  low: { label: 'Low stock', badge: 'warning' },
  out: { label: 'Out of stock', badge: 'danger' },
};
