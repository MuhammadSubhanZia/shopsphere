import { STATUS_META } from '../../utils/orderStatus.js';

/** Coloured pill showing an order status (Pending, Shipped, ...). */
export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;

  return (
    <span className={`badge rounded-pill text-bg-${meta.badge} px-3 py-2`}>
      <i className={`bi ${meta.icon} me-1`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
