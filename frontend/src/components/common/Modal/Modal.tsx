import { ReactNode, useEffect } from 'react';
import clsx from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-surface shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between border-b border-grayLight px-6 py-4">
          <div className="text-h3 font-bold text-textPrimary">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              'rounded-full p-2 text-textSecondary hover:bg-grayLighter focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto px-6 py-5 text-textPrimary">{children}</div>
      </div>
    </div>
  );
}

export default Modal;

