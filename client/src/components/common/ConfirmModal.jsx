import Modal from './Modal.jsx';

/** "Are you sure?" dialog. `variant` is a Bootstrap colour for the confirm button. */
export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  busy = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      title={title}
      onClose={busy ? () => {} : onClose}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-dark rounded-pill px-4" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className={`btn btn-${variant} rounded-pill px-4`} onClick={onConfirm} disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="mb-0">{message}</p>
    </Modal>
  );
}
