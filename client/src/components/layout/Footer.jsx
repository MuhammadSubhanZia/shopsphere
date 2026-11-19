import { Link } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import './Footer.css';

const SHOP_LINKS = [
  { label: 'All Products', to: '/products' },
  { label: 'Electronics', to: '/products?category=electronics' },
  { label: 'Fashion', to: '/products?category=fashion' },
  { label: 'Home & Living', to: '/products?category=home-living' },
  { label: 'Beauty', to: '/products?category=beauty' },
];

const ACCOUNT_LINKS = [
  { label: 'Log in', to: '/login' },
  { label: 'Create account', to: '/register' },
  { label: 'My Wishlist', to: '/wishlist' },
  { label: 'Shopping Cart', to: '/cart' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ss-footer">
      <div className="container">
        <div className="row g-4 g-lg-5">
          <div className="col-12 col-lg-4">
            <Link to="/" aria-label="ShopSphere home">
              <Logo light />
            </Link>
            <p className="ss-footer__about mt-3">
              Your one-stop online store for electronics, fashion, home essentials and more –
              quality products, fair prices and fast delivery.
            </p>
          </div>

          <div className="col-6 col-md-4 col-lg-2 offset-lg-1">
            <h6 className="ss-footer__heading">Shop</h6>
            <ul className="ss-footer__list">
              {SHOP_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <h6 className="ss-footer__heading">Account</h6>
            <ul className="ss-footer__list">
              {ACCOUNT_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <h6 className="ss-footer__heading">Contact</h6>
            <ul className="ss-footer__list ss-footer__contact">
              <li>
                <i className="bi bi-geo-alt" /> Lahore, Pakistan
              </li>
              <li>
                <i className="bi bi-envelope" /> support@shopsphere.pk
              </li>
              <li>
                <i className="bi bi-clock" /> Mon – Sat, 9am – 8pm
              </li>
            </ul>
          </div>
        </div>

        <div className="ss-footer__bottom">
          <span>© {year} ShopSphere. All rights reserved.</span>
          <span>
            CS4032 Web Programming project · Muhammad Abdullah Sheikh &amp; Subhan Zia
          </span>
        </div>
      </div>
    </footer>
  );
}
