import './Spinner.css';

/** Centered loading indicator. `inline` renders it without the large vertical padding. */
export default function Spinner({ label = 'Loading...', inline = false }) {
  return (
    <div className={`ss-spinner ${inline ? 'ss-spinner--inline' : ''}`} role="status" aria-live="polite">
      <div className="spinner-border text-primary" aria-hidden="true" />
      <span className="ss-spinner__label">{label}</span>
    </div>
  );
}
