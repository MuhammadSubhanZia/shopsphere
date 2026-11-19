// Everything the UI and the API need to know about order statuses.

/** The normal life of an order, in order. */
export const ORDER_FLOW = ['pending', 'processing', 'shipped', 'delivered'];

/** Every valid status (the flow plus cancelled). */
export const ORDER_STATUSES = [...ORDER_FLOW, 'cancelled'];

// `badge` is a Bootstrap colour name used with the text-bg-* classes.
export const STATUS_META = {
  pending: { label: 'Pending', badge: 'warning', icon: 'bi-hourglass-split' },
  processing: { label: 'Processing', badge: 'info', icon: 'bi-box-seam' },
  shipped: { label: 'Shipped', badge: 'primary', icon: 'bi-truck' },
  delivered: { label: 'Delivered', badge: 'success', icon: 'bi-check2-circle' },
  cancelled: { label: 'Cancelled', badge: 'danger', icon: 'bi-x-circle' },
};

/** Wording used on the tracking timeline. */
export const TIMELINE_LABELS = {
  pending: 'Order placed',
  processing: 'Being prepared',
  shipped: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/** Customers may cancel until the parcel has been handed to the courier. */
export const canCancel = (status) => status === 'pending' || status === 'processing';

/** 1001 -> "SS-1001" */
export const orderRef = (id) => `SS-${id}`;

export const PAYMENT_LABELS = {
  cod: 'Cash on delivery',
  card: 'Credit / debit card',
};
