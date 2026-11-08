import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

/**
 * Accessible dialog built with Bootstrap's modal styles.
 * Closes on Escape, on a click outside the dialog and with the X button.
 * Render it only while it should be visible: {open && <Modal ...>}
 */
export default function Modal({ title, onClose, children, footer, size = '' }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose; // always call the latest onClose without re-running the effect below

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', handleKey);
    document.body.classList.add('modal-open');
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.classList.remove('modal-open');
    };
  }, []);

  return createPortal(
    <>
      <div
        className="modal d-block ss-modal"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ss-modal-title"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeRef.current();
        }}
      >
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size ? `modal-${size}` : ''}`}>
          <div className="modal-content" ref={dialogRef} tabIndex={-1}>
            <div className="modal-header">
              <h2 className="modal-title h5" id="ss-modal-title">
                {title}
              </h2>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>,
    document.body
  );
}
