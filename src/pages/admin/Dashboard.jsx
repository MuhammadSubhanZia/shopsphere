import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import StatCard from '../../components/admin/StatCard.jsx';
import StatusBadge from '../../components/orders/StatusBadge.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { fetchAllOrders, selectOrders, selectOrdersStatus } from '../../store/slices/ordersSlice.js';
import { selectAllProducts } from '../../store/slices/productsSlice.js';
import { selectCategories } from '../../store/slices/categoriesSlice.js';
import { formatPrice, formatDate } from '../../utils/formatters.js';
import { ORDER_STATUSES, STATUS_META, orderRef } from '../../utils/orderStatus.js';
import { LOW_STOCK_THRESHOLD } from '../../utils/inventory.js';
import './Dashboard.css';

export default function Dashboard() {
  useDocumentTitle('Admin dashboard');
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const ordersStatus = useSelector(selectOrdersStatus);
  const products = useSelector(selectAllProducts);
  const categories = useSelector(selectCategories);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // Every number on the page is derived from the orders and products in the store.
  const stats = useMemo(() => {
    const counted = orders.filter((order) => order.status !== 'cancelled');
    const revenue = counted.reduce((sum, order) => sum + order.total, 0);

    const byCategory = {};
    counted.forEach((order) =>
      order.items.forEach((item) => {
        byCategory[item.category] = (byCategory[item.category] || 0) + item.price * item.quantity;
      })
    );

    const byStatus = {};
    ORDER_STATUSES.forEach((status) => {
      byStatus[status] = orders.filter((order) => order.status === status).length;
    });

    return {
      revenue,
      orderCount: orders.length,
      pending: byStatus.pending,
      byStatus,
      byCategory,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD),
      outOfStock: products.filter((p) => p.stock === 0),
    };
  }, [orders, products]);

  const categoryRows = useMemo(
    () =>
      categories
        .map((category) => ({ ...category, revenue: stats.byCategory[category.slug] || 0 }))
        .sort((a, b) => b.revenue - a.revenue),
    [categories, stats.byCategory]
  );
  const topRevenue = Math.max(1, ...categoryRows.map((row) => row.revenue));

  const stockAlerts = useMemo(
    () => [...stats.outOfStock, ...[...stats.lowStock].sort((a, b) => a.stock - b.stock)].slice(0, 6),
    [stats.outOfStock, stats.lowStock]
  );

  const recent = orders.slice(0, 6);

  if (ordersStatus === 'idle' || (ordersStatus === 'loading' && orders.length === 0)) {
    return <Spinner label="Loading dashboard..." />;
  }

  return (
    <>
      <AdminPageHeader title="Dashboard" subtitle="A quick look at how the store is doing." />

      {/* ---------- Key numbers ---------- */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-4">
          <StatCard icon="bi-cash-stack" label="Revenue" value={formatPrice(stats.revenue)} hint="Excluding cancelled orders" tone="teal" />
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatCard icon="bi-receipt" label="Total orders" value={stats.orderCount} to="/admin/orders" tone="ink" />
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatCard icon="bi-hourglass-split" label="Pending orders" value={stats.pending} hint="Waiting to be processed" to="/admin/orders" tone="warning" />
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatCard icon="bi-box-seam" label="Products" value={products.length} to="/admin/products" tone="accent" />
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatCard icon="bi-exclamation-triangle" label="Low stock" value={stats.lowStock.length} hint={`${LOW_STOCK_THRESHOLD} units or fewer`} to="/admin/inventory" tone="warning" />
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatCard icon="bi-x-octagon" label="Out of stock" value={stats.outOfStock.length} to="/admin/inventory" tone="danger" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* ---------- Recent orders ---------- */}
        <div className="col-xl-7">
          <section className="ss-dash-card">
            <div className="ss-dash-card__head">
              <h2>Recent orders</h2>
              <Link to="/admin/orders">View all</Link>
            </div>
            {recent.length === 0 ? (
              <p className="ss-muted p-4 mb-0">No orders yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table ss-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>#{orderRef(order.id)}</strong>
                          <small className="d-block ss-muted">{formatDate(order.createdAt)}</small>
                        </td>
                        <td className="text-nowrap">{order.customer.name}</td>
                        <td className="fw-bold text-nowrap">{formatPrice(order.total)}</td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* ---------- Stock alerts ---------- */}
        <div className="col-xl-5">
          <section className="ss-dash-card">
            <div className="ss-dash-card__head">
              <h2>Stock alerts</h2>
              <Link to="/admin/inventory">Manage</Link>
            </div>
            {stockAlerts.length === 0 ? (
              <p className="ss-muted p-4 mb-0">
                <i className="bi bi-check-circle-fill text-success me-2" />
                All products are well stocked.
              </p>
            ) : (
              <ul className="ss-alert-list">
                {stockAlerts.map((product) => (
                  <li key={product.id}>
                    <span>
                      {product.name}
                      <small>{product.brand}</small>
                    </span>
                    <span className={`badge rounded-pill ${product.stock === 0 ? 'text-bg-danger' : 'text-bg-warning'}`}>
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className="row g-4">
        {/* ---------- Revenue by category ---------- */}
        <div className="col-lg-7">
          <section className="ss-dash-card">
            <div className="ss-dash-card__head">
              <h2>Revenue by category</h2>
            </div>
            <ul className="ss-bars">
              {categoryRows.map((row) => (
                <li key={row.id}>
                  <span className="ss-bars__label">{row.name}</span>
                  <span className="ss-bars__track">
                    <span className="ss-bars__fill" style={{ width: `${(row.revenue / topRevenue) * 100}%`, '--tint': row.tint }} />
                  </span>
                  <span className="ss-bars__value">{formatPrice(row.revenue)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ---------- Orders by status ---------- */}
        <div className="col-lg-5">
          <section className="ss-dash-card">
            <div className="ss-dash-card__head">
              <h2>Orders by status</h2>
            </div>
            <ul className="ss-status-list">
              {ORDER_STATUSES.map((status) => (
                <li key={status}>
                  <span>
                    <i className={`bi ${STATUS_META[status].icon} me-2`} />
                    {STATUS_META[status].label}
                  </span>
                  <strong>{stats.byStatus[status]}</strong>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
