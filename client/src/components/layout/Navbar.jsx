import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Logo from '../common/Logo.jsx';
import { selectCartCount } from '../../store/slices/cartSlice.js';
import { selectWishlistCount } from '../../store/slices/wishlistSlice.js';
import { selectUser, logout } from '../../store/slices/authSlice.js';
import { showToast } from '../../store/slices/uiSlice.js';
import { getInitials } from '../../utils/formatters.js';
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

/** Avatar button + dropdown with the account links (desktop). */
function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the dropdown when clicking outside of it or pressing Escape.
  useEffect(() => {
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <div className="ss-user-menu" ref={menuRef}>
      <button
        type="button"
        className="ss-avatar-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="ss-avatar">{getInitials(user.name)}</span>
        <span className="ss-user-name d-none d-xl-inline">{user.name.split(' ')[0]}</span>
        <i className="bi bi-chevron-down small" />
      </button>

      {open && (
        <div className="ss-user-dropdown" role="menu">
          <div className="ss-user-dropdown__head">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Link to="/orders" role="menuitem" onClick={close}>
            <i className="bi bi-receipt" /> My orders
          </Link>
          <Link to="/wishlist" role="menuitem" onClick={close}>
            <i className="bi bi-heart" /> Wishlist
          </Link>
          <Link to="/profile" role="menuitem" onClick={close}>
            <i className="bi bi-person" /> My profile
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" role="menuitem" onClick={close}>
              <i className="bi bi-speedometer2" /> Admin panel
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              onLogout();
            }}
          >
            <i className="bi bi-box-arrow-right" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Badge counts and the signed-in user come straight from the Redux store.
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const user = useSelector(selectUser);

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/products?q=${encodeURIComponent(term)}` : '/products');
    closeMenu();
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(showToast('You have been logged out', 'info'));
    closeMenu();
    navigate('/');
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

            <div className="d-none d-lg-flex align-items-center gap-2 ms-2">
              {user ? (
                <UserMenu user={user} onLogout={handleLogout} />
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-dark btn-sm rounded-pill px-3">
                    Log in
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-3">
                    Sign up
                  </Link>
                </>
              )}
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

            {/* Account links for small screens (large screens use the icons / dropdown above) */}
            <div className="d-lg-none mt-3 pb-2">
              {user ? (
                <ul className="ss-mobile-account">
                  <li className="ss-mobile-account__name">
                    <span className="ss-avatar">{getInitials(user.name)}</span>
                    <div>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                  </li>
                  <li>
                    <Link to="/orders" onClick={closeMenu}>
                      <i className="bi bi-receipt" /> My orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" onClick={closeMenu}>
                      <i className="bi bi-person" /> My profile
                    </Link>
                  </li>
                  {user.role === 'admin' && (
                    <li>
                      <Link to="/admin" onClick={closeMenu}>
                        <i className="bi bi-speedometer2" /> Admin panel
                      </Link>
                    </li>
                  )}
                  <li>
                    <button type="button" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right" /> Log out
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="d-flex gap-2">
                  <Link to="/login" className="btn btn-outline-dark rounded-pill flex-fill" onClick={closeMenu}>
                    Log in
                  </Link>
                  <Link to="/register" className="btn btn-primary rounded-pill flex-fill" onClick={closeMenu}>
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
