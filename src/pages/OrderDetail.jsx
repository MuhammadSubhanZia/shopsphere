import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ProductImage from '../components/common/ProductImage.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';
import StatusBadge from '../components/orders/StatusBadge.jsx';
import StatusTimeline from '../components/orders/StatusTimeline.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { selectUser } from '../store/slices/authSlice.js';
import { fetchMyOrders, cancelMyOrder, selectOrderById, selectOrdersStatus } from '../store/slices/ordersSlice.js';
import { fetchProducts } from '../store/slices/productsSlice.js';
import { showToast } from '../store/slices/uiSlice.js';
import { formatPrice, formatDateTime } from '../utils/formatters.js';
import { getErrorMessage } from '../utils/errors.js';
import { orderRef, canCancel, PAYMENT_LABELS } from '../utils/orderStatus.js';
import './OrderDetail.css';

export default function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const order = useSelector(selectOrderById(id));
  const status = useSelector(selectOrdersStatus);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useDocumentTitle(order ? `Order ${orderRef(order.id)}` : 'Order');

  // Opening the page directly (or refreshing it) means the order list has to be loaded first.
  useEffect(() => {
    if (!order) dispatch(fetchMyOrders(user.id));
  }, [dispatch, user.id, order?.id]);

  if (!order) {
    if (status === 'succeeded' || status === 'failed') {
      return (
        <div className="container py-5">
          <EmptyState icon="bi-receipt" title="Order not found" message="We could not find this order in your account.">
            <Link to="/orders" className="btn btn-primary rounded-pill px-4">
              Back to my orders
            </Link>
          </EmptyState>
        </div>
      );
    }
    return <Spinner label="Loading order..." />;
  }

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await dispatch(cancelMyOrder({ id: order.id, userId: user.id })).unwrap();
      dispatch(fetchProducts()); // the items go back into stock
      dispatch(showToast(`Order #${orderRef(order.id)} was cancelled`, 'info'));
      setConfirmOpen(false);
    } catch (error) {
      dispatch(showToast(getErrorMessage(error), 'error'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container py-4 py-lg-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb ss-breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/orders">My orders</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            #{orderRef(order.id)}
          </li>
        </ol>
      </nav>

      <div className="ss-order-head">
        <div>
          <h1>Order #{orderRef(order.id)}</h1>
          <p>Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="ss-order-head__actions">
          <StatusBadge status={order.status} />
          <button type="button" className="btn btn-outline-dark btn-sm rounded-pill" onClick={() => window.print()}>
            <i className="bi bi-printer me-2" />
            Print invoice
          </button>
        </div>
      </div>

      <section className="ss-card p-4 mb-4">
        <h2 className="h5 mb-4">Order tracking</h2>
        <StatusTimeline order={order} />
      </section>

      <div className="row g-4">
        <div className="col-lg-8">
          <section className="ss-card">
            <h2 className="h5 p-4 pb-0 mb-0">Items ({order.items.length})</h2>
            <ul className="ss-order-items">
              {order.items.map((item) => (
                <li key={item.productId}>
                  <Link to={`/products/${item.productId}`}>
                    <ProductImage product={item} size="sm" />
                  </Link>
                  <span>
                    <Link to={`/products/${item.productId}`} className="ss-order-items__name">
                      {item.name}
                    </Link>
                    <small>
                      {formatPrice(item.price)} × {item.quantity}
                    </small>
                  </span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="col-lg-4">
          <section className="ss-card p-4 mb-4">
            <h2 className="h5 mb-3">Delivery address</h2>
            <address className="ss-order-address">
              <strong>{order.shipping.fullName}</strong>
              {order.shipping.address}
              <br />
              {order.shipping.city}
              {order.shipping.postalCode && ` ${order.shipping.postalCode}`}
              <br />
              <span>
                <i className="bi bi-telephone me-1" />
                {order.shipping.phone}
              </span>
            </address>
            {order.shipping.notes && <p className="small ss-muted mb-0">Note: {order.shipping.notes}</p>}
          </section>

          <section className="ss-card p-4">
            <h2 className="h5 mb-3">Payment summary</h2>
            <dl className="ss-order-totals">
              <div>
                <dt>Method</dt>
                <dd>
                  {PAYMENT_LABELS[order.paymentMethod]}
                  {order.cardLast4 && ` (•••• ${order.cardLast4})`}
                </dd>
              </div>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="is-discount">
                  <dt>Discount ({order.promoCode})</dt>
                  <dd>-{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div>
                <dt>Delivery</dt>
                <dd>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</dd>
              </div>
              <div className="is-total">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>

            {canCancel(order.status) && (
              <button type="button" className="btn btn-outline-danger w-100 rounded-pill mt-3 ss-no-print" onClick={() => setConfirmOpen(true)}>
                Cancel order
              </button>
            )}
          </section>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Cancel this order?"
          message={`Order #${orderRef(order.id)} will be cancelled and the items returned to stock. This cannot be undone.`}
          confirmLabel="Yes, cancel order"
          cancelLabel="Keep order"
          busy={cancelling}
          onConfirm={handleCancel}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
