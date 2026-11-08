import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logo from '../common/Logo.jsx';
import { selectCartCount } from '../../store/slices/cartSlice.js';
import { selectWishlistCount } from '../../store/slices/wishlistSlice.js';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Shop' },
];

function IconLink({ to, icon, label, count }) {
  return (
    <NavLink to={to} className="ss-icon-btn" aria-label={label} title={label}>
      <i className={`bi ${icon}`} />
      {count > 0 && <span className="ss-count-badge">{count}</span>}
    </NavLink>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Badge counts come straight from the Redux store.
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/products?q=${encodeURIComponent(term)}` : '/products');
    closeMenu();
  };

  return (
    <header className="ss-header sticky-top">
      <div className="ss-announce text-center">
        <i className="bi bi-truck me-2" />
        Free delivery on orders over Rs. 5,000
      </div>

      <nav className="navbar navbar-expand-lg ss-navbar" aria-label="Main navigation">
        <div className="container">
          <Link to="/" className="navbar-brand me-lg-4" onClick={closeMenu}>
            <Logo />
          </Link>

          {/* Icons stay visible on mobile; on large screens they sit at the far right */}
          <div className="d-flex align-items-center gap-1 ms-auto ms-lg-0 order-lg-3">
            <IconLink to="/wishlist" icon="bi-heart" label="Wishlist" count={wishlistCount} />
            <IconLink to="/cart" icon="bi-bag" label="Cart" count={cartCount} />

            <div className="d-none d-lg-flex gap-2 ms-2">
              <Link to="/login" className="btn btn-outline-dark btn-sm rounded-pill px-3">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-3">
                Sign up
              </Link>
            </div>

            <button
              className="navbar-toggler ms-1"
              type="button"
              aria-controls="ss-main-nav"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>

          <div
            id="ss-main-nav"
            className={`collapse navbar-collapse order-lg-2 ${menuOpen ? 'show' : ''}`}
          >
            <ul className="navbar-nav me-lg-3 ss-nav-links">
              {NAV_LINKS.map(({ to, label, end }) => (
                <li className="nav-item" key={to}>
                  <NavLink to={to} end={end} className="nav-link" onClick={closeMenu}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <form className="ss-search flex-grow-1" role="search" onSubmit={handleSearch}>
              <i className="bi bi-search" aria-hidden="true" />
              <input
                type="search"
                className="form-control"
                placeholder="Search for products..."
                aria-label="Search products"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </form>

            {/* Auth buttons for small screens (hidden on large, shown in the icon row there) */}
            <div className="d-flex d-lg-none gap-2 mt-3 pb-2">
              <Link
                to="/login"
                className="btn btn-outline-dark rounded-pill flex-fill"
                onClick={closeMenu}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn btn-primary rounded-pill flex-fill"
                onClick={closeMenu}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
