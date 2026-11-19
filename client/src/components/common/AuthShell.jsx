import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import './AuthShell.css';

const PERKS = [
  'Save products to your wishlist',
  'Track every order in real time',
  'Check out faster next time',
];

/** Two-panel layout shared by the Login and Register pages. */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="container py-4 py-lg-5">
      <div className="ss-auth">
        <div className="ss-auth__brand d-none d-lg-flex">
          <Link to="/" aria-label="ShopSphere home">
            <Logo light />
          </Link>
          <div>
            <h2>Everything you love, one tap away.</h2>
            <ul>
              {PERKS.map((perk) => (
                <li key={perk}>
                  <i className="bi bi-check-circle-fill" /> {perk}
                </li>
              ))}
            </ul>
          </div>
          <small>© ShopSphere</small>
        </div>

        <div className="ss-auth__panel">
          <h1 className="ss-auth__title">{title}</h1>
          <p className="ss-auth__subtitle">{subtitle}</p>
          {children}
          {footer && <p className="ss-auth__footer">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
