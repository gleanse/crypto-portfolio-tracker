import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import {
  HiExclamationTriangle,
  HiCheckCircle,
  HiInformationCircle,
} from 'react-icons/hi2';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <HiExclamationTriangle className="w-6 h-6 text-warning" />;
      case 'success':
        return <HiCheckCircle className="w-6 h-6 text-positive" />;
      case 'danger':
        return <HiExclamationTriangle className="w-6 h-6 text-negative" />;
      default:
        return <HiInformationCircle className="w-6 h-6 text-white" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="bg-surface rounded-2xl shadow-2xl max-w-md w-full border border-primary/20 transform animate-scale-in relative z-10">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary to-primary/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-white">{getIcon()}</div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-lg cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 bg-surface">
          <p className="text-foreground leading-relaxed">{message}</p>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 p-6 bg-surface rounded-b-2xl">
          <button
            onClick={onCancel || onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-foreground bg-surface-light border border-surface-border rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium ${
              type === 'warning'
                ? 'bg-warning hover:bg-warning/90 hover:scale-105'
                : type === 'success'
                ? 'bg-positive hover:bg-positive/90 hover:scale-105'
                : type === 'danger'
                ? 'bg-negative hover:bg-negative/90 hover:scale-105'
                : 'bg-secondary hover:bg-secondary/90 hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.15s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;
