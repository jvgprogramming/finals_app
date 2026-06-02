import { XMarkIcon } from '@heroicons/react/24/outline';

type ConfirmModalProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px' }}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onCancel}
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden />
        </button>
        <div className="checkout-modal-inner">
          <h3 className="modal-title">{title}</h3>
          <p style={{ marginBottom: '24px', color: 'var(--cocoa)', lineHeight: 1.5 }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-primary" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ backgroundColor: 'var(--danger)' }}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
