import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ProductImage from '../components/common/ProductImage.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { selectUser } from '../store/slices/authSlice.js';
import { fetchMyOrders, selectOrderById, selectOrdersStatus } from '../store/slices/ordersSlice.js';
import { formatPrice } from '../utils/formatters.js';
import { orderRef, PAYMENT_LABELS } from '../utils/orderStatus.js';
import './OrderSuccess.css';

export default function OrderSuccess() {
  useDocumentTitle('Order confirmed');
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const order = useSelector(selectOrderById(id));
  const status = useSelector(selectOrdersStatus);

  // Right after checkout the order is already in the store. After a page refresh it has to be loaded again.
  useEffect(() => {
    if (!order) dispatch(fetchMyOrders(user.id));
  }, [dispatch, user.id, order?.id]);

  if (!order) {
    if (status === 'succeeded' || status === 'failed') {
      return (
        <div className="container py-5">
          <EmptyState icon="bi-receipt" title="Order not found" message="We could not find this order in your account.">
            <Link to="/orders" className="btn btn-primary rounded-pill px-4">
              View my orders
            </Link>
          </EmptyState>
        </div>
      );
    }
    return <Spinner label="Loading your order..." />;
  }

  return (
    <div className="container py-4 py-lg-5">
      <div className="ss-success">
        <div className="ss-success__icon">
          <i className="bi bi-check-lg" />
        </div>
        <h1>Thank you, {order.shipping.fullName.split(' ')[0]}!</h1>
        <p className="ss-success__lead">
          Your order <strong>#{orderRef(order.id)}</strong> has been placed. We will send it to{' '}
          <strong>{order.shipping.city}</strong> within 2–4 working days.
        </p>

        <div className="ss-success__card">
          <ul>
            {order.items.map((item) => (
              <li key={item.productId}>
                <ProductImage product={item} size="sm" />
                <span>
                  {item.name}
                  <small>Qty {item.quantity}</small>
                </span>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>

          <dl>
            <div>
              <dt>Payment</dt>
              <dd>
                {PAYMENT_LABELS[order.paymentMethod]}
                {order.cardLast4 && ` (•••• ${order.cardLast4})`}
              </dd>
            </div>
            <div>
              <dt>Delivery to</dt>
              <dd>
                {order.shipping.address}, {order.shipping.city}
              </dd>
            </div>
            <div className="is-total">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <Link to={`/orders/${order.id}`} className="btn btn-primary btn-lg rounded-pill px-4">
            Track this order
          </Link>
          <Link to="/products" className="btn btn-outline-dark btn-lg rounded-pill px-4">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
