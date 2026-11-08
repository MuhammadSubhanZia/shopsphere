import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader.jsx';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ProductImage from '../components/common/ProductImage.jsx';
import StatusBadge from '../components/orders/StatusBadge.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { selectUser } from '../store/slices/authSlice.js';
import { fetchMyOrders, selectOrders, selectOrdersStatus } from '../store/slices/ordersSlice.js';
import { formatPrice, formatDate, pluralize } from '../utils/formatters.js';
import { ORDER_STATUSES, STATUS_META, orderRef } from '../utils/orderStatus.js';
import './Orders.css';

const MAX_THUMBS = 4;

export default function Orders() {
  useDocumentTitle('My orders');
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const orders = useSelector(selectOrders);
  const status = useSelector(selectOrdersStatus);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchMyOrders(user.id));
  }, [dispatch, user.id]);

  const counts = useMemo(() => {
    const result = { all: orders.length };
    ORDER_STATUSES.forEach((s) => {
      result[s] = orders.filter((order) => order.status === s).length;
    });
    return result;
  }, [orders]);

  const visible = filter === 'all' ? orders : orders.filter((order) => order.status === filter);

  let content;
  if (status === 'loading' || status === 'idle') {
    content = <Spinner label="Loading your orders..." />;
  } else if (status === 'failed') {
    content = (
      <EmptyState icon="bi-wifi-off" title="Could not load your orders" message="Please try again in a moment.">
        <button type="button" className="btn btn-primary rounded-pill px-4" onClick={() => dispatch(fetchMyOrders(user.id))}>
          Try again
        </button>
      </EmptyState>
    );
  } else if (orders.length === 0) {
    content = (
      <EmptyState icon="bi-receipt" title="No orders yet" message="When you place an order it will show up here so you can track it.">
        <Link to="/products" className="btn btn-primary rounded-pill px-4">
          Start shopping
        </Link>
      </EmptyState>
    );
  } else {
    content = (
      <>
        <div className="ss-order-tabs" role="tablist" aria-label="Filter orders by status">
          {['all', ...ORDER_STATUSES].map((key) => (
            <button
              type="button"
              role="tab"
              key={key}
              aria-selected={filter === key}
              className={filter === key ? 'is-active' : ''}
              onClick={() => setFilter(key)}
            >
              {key === 'all' ? 'All' : STATUS_META[key].label} <span>{counts[key]}</span>
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <EmptyState icon="bi-funnel" title="Nothing here" message="You have no orders with this status." />
        ) : (
          <ul className="ss-order-list">
            {visible.map((order) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <li key={order.id} className="ss-order-card">
                  <div className="ss-order-card__head">
                    <div>
                      <strong>Order #{orderRef(order.id)}</strong>
                      <small>Placed on {formatDate(order.createdAt)}</small>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="ss-order-card__body">
                    <div className="ss-order-card__thumbs">
                      {order.items.slice(0, MAX_THUMBS).map((item) => (
                        <ProductImage key={item.productId} product={item} size="sm" />
                      ))}
                      {order.items.length > MAX_THUMBS && <span className="ss-order-card__more">+{order.items.length - MAX_THUMBS}</span>}
                    </div>
                    <div className="ss-order-card__meta">
                      <span>{pluralize(itemCount, 'item')}</span>
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                    <Link to={`/orders/${order.id}`} className="btn btn-outline-dark rounded-pill px-4">
                      View details
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader title="My orders" subtitle="Track your purchases and see your order history." />
      <div className="container py-4 py-lg-5">{content}</div>
    </>
  );
}
