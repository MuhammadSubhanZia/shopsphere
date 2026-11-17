import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import ProductImage from '../../components/common/ProductImage.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/orders/StatusBadge.jsx';
import StatusTimeline from '../../components/orders/StatusTimeline.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { fetchAllOrders, changeOrderStatus, selectOrders, selectOrdersStatus } from '../../store/slices/ordersSlice.js';
import { fetchProducts } from '../../store/slices/productsSlice.js';
import { showToast } from '../../store/slices/uiSlice.js';
import { formatPrice, formatDateTime } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/errors.js';
import { ORDER_STATUSES, STATUS_META, orderRef, PAYMENT_LABELS } from '../../utils/orderStatus.js';
import './ManageOrders.css';

export default function ManageOrders() {
  useDocumentTitle('Manage orders');
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const status = useSelector(selectOrdersStatus);

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [viewingId, setViewingId] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter && order.status !== statusFilter) return false;
      if (!term) return true;
      return `${orderRef(order.id)} ${order.customer.name} ${order.customer.email}`.toLowerCase().includes(term);
    });
  }, [orders, statusFilter, search]);

  const counts = useMemo(() => {
    const result = {};
    orders.forEach((order) => {
      result[order.status] = (result[order.status] || 0) + 1;
    });
    return result;
  }, [orders]);

  const viewing = orders.find((order) => order.id === viewingId) || null;

  const applyStatus = async (order, nextStatus) => {
    setUpdatingId(order.id);
    try {
      await dispatch(changeOrderStatus({ id: order.id, status: nextStatus })).unwrap();
      if (nextStatus === 'cancelled') dispatch(fetchProducts()); // items go back into stock
      dispatch(showToast(`${orderRef(order.id)} is now ${STATUS_META[nextStatus].label.toLowerCase()}`));
    } catch (error) {
      dispatch(showToast(getErrorMessage(error), 'error'));
    } finally {
      setUpdatingId(null);
      setPendingCancel(null);
    }
  };

  const handleSelect = (order, nextStatus) => {
    if (nextStatus === order.status) return;
    if (nextStatus === 'cancelled') setPendingCancel(order); // cancelling needs a confirmation
    else applyStatus(order, nextStatus);
  };

  let content;
  if (status === 'loading' && orders.length === 0) {
    content = <Spinner label="Loading orders..." />;
  } else if (filtered.length === 0) {
    content = <EmptyState icon="bi-receipt" title="No orders found" message="Try another status or search term." />;
  } else {
    content = (
      <div className="ss-table-card">
        <div className="table-responsive">
          <table className="table ss-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ minWidth: 160 }}>Change status</th>
                <th className="text-end">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{orderRef(order.id)}</strong>
                    <small className="d-block ss-muted">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </small>
                  </td>
                  <td>
                    {order.customer.name}
                    <small className="d-block ss-muted">{order.customer.email}</small>
                  </td>
                  <td className="text-nowrap">{formatDateTime(order.createdAt)}</td>
                  <td className="text-nowrap">
                    <strong>{formatPrice(order.total)}</strong>
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      aria-label={`Status of order ${orderRef(order.id)}`}
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(event) => handleSelect(order, event.target.value)}
                    >
                      {ORDER_STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {STATUS_META[value].label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-end">
                    <button type="button" className="ss-icon-action" aria-label={`View order ${orderRef(order.id)}`} onClick={() => setViewingId(order.id)}>
                      <i className="bi bi-eye" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader title="Orders" subtitle={`${orders.length} orders in total`} />

      <div className="ss-admin-toolbar">
        <div className="ss-admin-search">
          <i className="bi bi-search" aria-hidden="true" />
          <input
            type="search"
            className="form-control"
            placeholder="Search by order, name or email..."
            aria-label="Search orders"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select
          className="form-select w-auto"
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">All statuses ({orders.length})</option>
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_META[value].label} ({counts[value] || 0})
            </option>
          ))}
        </select>
      </div>

      {content}

      {viewing && (
        <Modal title={`Order ${orderRef(viewing.id)}`} size="lg" onClose={() => setViewingId(null)}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
            <span className="ss-muted">Placed on {formatDateTime(viewing.createdAt)}</span>
            <StatusBadge status={viewing.status} />
          </div>

          <StatusTimeline order={viewing} />

          <h3 className="h6 mt-4">Items</h3>
          <ul className="ss-mo-items">
            {viewing.items.map((item) => (
              <li key={item.productId}>
                <ProductImage product={item} size="sm" />
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {formatPrice(item.price)} × {item.quantity}
                  </small>
                </span>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>

          <div className="row g-4 mt-1">
            <div className="col-md-6">
              <h3 className="h6">Customer &amp; delivery</h3>
              <address className="ss-mo-address">
                <strong>{viewing.shipping.fullName}</strong>
                {viewing.shipping.address}, {viewing.shipping.city}
                {viewing.shipping.postalCode && ` ${viewing.shipping.postalCode}`}
                <br />
                <i className="bi bi-telephone me-1" />
                {viewing.shipping.phone}
                <br />
                <i className="bi bi-envelope me-1" />
                {viewing.customer.email}
              </address>
              {viewing.shipping.notes && <p className="small ss-muted mb-0">Note: {viewing.shipping.notes}</p>}
            </div>
            <div className="col-md-6">
              <h3 className="h6">Payment</h3>
              <dl className="ss-mo-totals">
                <div>
                  <dt>Method</dt>
                  <dd>
                    {PAYMENT_LABELS[viewing.paymentMethod]}
                    {viewing.cardLast4 && ` (•••• ${viewing.cardLast4})`}
                  </dd>
                </div>
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(viewing.subtotal)}</dd>
                </div>
                {viewing.discount > 0 && (
                  <div>
                    <dt>Discount ({viewing.promoCode})</dt>
                    <dd>-{formatPrice(viewing.discount)}</dd>
                  </div>
                )}
                <div>
                  <dt>Delivery</dt>
                  <dd>{viewing.shippingFee === 0 ? 'Free' : formatPrice(viewing.shippingFee)}</dd>
                </div>
                <div className="is-total">
                  <dt>Total</dt>
                  <dd>{formatPrice(viewing.total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </Modal>
      )}

      {pendingCancel && (
        <ConfirmModal
          title="Cancel this order?"
          message={`Order ${orderRef(pendingCancel.id)} will be cancelled and its items returned to stock.`}
          confirmLabel="Cancel order"
          cancelLabel="Keep order"
          busy={updatingId === pendingCancel.id}
          onConfirm={() => applyStatus(pendingCancel, 'cancelled')}
          onClose={() => setPendingCancel(null)}
        />
      )}
    </>
  );
}
