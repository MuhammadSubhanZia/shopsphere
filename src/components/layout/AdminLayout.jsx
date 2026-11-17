import { Link, NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: 'bi-speedometer2', end: true },
  { to: '/admin/products', label: 'Products', icon: 'bi-box-seam' },
  { to: '/admin/categories', label: 'Categories', icon: 'bi-tags' },
  { to: '/admin/inventory', label: 'Inventory', icon: 'bi-clipboard-data' },
  { to: '/admin/orders', label: 'Orders', icon: 'bi-receipt' },
];

/** Frame for every admin page: a sidebar on the left and the routed page on the right. */
export default function AdminLayout() {
  return (
    <div className="ss-admin">
      <div className="container">
        <div className="ss-admin__shell">
          <aside className="ss-admin__sidebar" aria-label="Admin navigation">
            <p className="ss-admin__label">Admin panel</p>
            <nav className="ss-admin__nav">
              {ADMIN_LINKS.map(({ to, label, icon, end }) => (
                <NavLink key={to} to={to} end={end} className="ss-admin__link">
                  <i className={`bi ${icon}`} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
            <Link to="/" className="ss-admin__back">
              <i className="bi bi-arrow-left" aria-hidden="true" /> Back to store
            </Link>
          </aside>

          <section className="ss-admin__content">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
