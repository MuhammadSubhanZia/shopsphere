import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectToasts, dismissToast } from '../../store/slices/uiSlice.js';
import './ToastHost.css';

const ICONS = {
  success: 'bi-check-circle-fill',
  error: 'bi-exclamation-octagon-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
};

function ToastItem({ toast }) {
  const dispatch = useDispatch();

  // Each toast removes itself after a few seconds.
  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), 3500);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div className={`ss-toast ss-toast--${toast.type}`} role="status">
      <i className={`bi ${ICONS[toast.type] || ICONS.info}`} aria-hidden="true" />
      <span className="ss-toast__message">{toast.message}</span>
      <button
        type="button"
        className="btn-close btn-close-white"
        aria-label="Dismiss notification"
        onClick={() => dispatch(dismissToast(toast.id))}
      />
    </div>
  );
}

/** Renders every active toast. Mounted once in the Layout. */
export default function ToastHost() {
  const toasts = useSelector(selectToasts);

  return (
    <div className="ss-toast-host" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
