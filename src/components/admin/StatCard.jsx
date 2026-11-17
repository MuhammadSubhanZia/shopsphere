import { Link } from 'react-router-dom';
import './StatCard.css';

/** Big-number tile for the dashboard. `tone` picks the icon colour: accent | teal | warning | danger | ink. */
export default function StatCard({ icon, label, value, hint, tone = 'accent', to }) {
  const body = (
    <>
      <span className={`ss-stat__icon is-${tone}`}>
        <i className={`bi ${icon}`} aria-hidden="true" />
      </span>
      <div>
        <span className="ss-stat__label">{label}</span>
        <strong className="ss-stat__value">{value}</strong>
        {hint && <small className="ss-stat__hint">{hint}</small>}
      </div>
    </>
  );

  return to ? (
    <Link to={to} className="ss-stat ss-stat--link">
      {body}
    </Link>
  ) : (
    <div className="ss-stat">{body}</div>
  );
}
