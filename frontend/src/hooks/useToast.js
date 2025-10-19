import { useState } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message, type = 'info', duration = 5000) => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, duration - 300);
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
    success: (message, duration = 3000) =>
      showToast(message, 'success', duration),
    error: (message, duration = 4000) => showToast(message, 'error', duration),
    warning: (message, duration = 3000) =>
      showToast(message, 'warning', duration),
    info: (message, duration = 3000) => showToast(message, 'info', duration),
  };
};
