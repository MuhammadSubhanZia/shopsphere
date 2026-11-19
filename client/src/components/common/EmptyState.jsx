import './EmptyState.css';

/** Friendly "nothing here" block. Pass buttons / links as children. */
export default function EmptyState({ icon = 'bi-inbox', title, message, children }) {
  return (
    <div className="ss-empty">
      <div className="ss-empty__icon">
        <i className={`bi ${icon}`} aria-hidden="true" />
      </div>
      <h2 className="ss-empty__title">{title}</h2>
      {message && <p className="ss-empty__message">{message}</p>}
      {children && <div className="ss-empty__actions">{children}</div>}
    </div>
  );
}
