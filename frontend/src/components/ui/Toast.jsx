import { useEffect, useState } from 'react';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiX,
  FiAlertTriangle,
} from 'react-icons/fi';

const Toast = ({ message, type = 'info', onClose, isVisible }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // show animation
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      // hide animation
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  if (!shouldRender) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5" />;
      default:
        return <FiInfo className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    const baseStyles =
      'flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm transition-all duration-300 transform';

    switch (type) {
      case 'success':
        return `${baseStyles} bg-positive/10 border-positive/30 text-positive`;
      case 'error':
        return `${baseStyles} bg-negative/10 border-negative/30 text-negative`;
      case 'warning':
        return `${baseStyles} bg-warning/10 border-warning/30 text-warning`;
      default:
        return `${baseStyles} bg-primary/10 border-primary/30 text-primary`;
    }
  };

  return (
    <div
      className={`
        ${getStyles()} 
        ${
          isAnimating
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0'
        }
        fixed top-4 right-4 z-50
      `}
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium text-foreground">
        {message}
      </span>
      <button
        onClick={handleClose}
        className="text-muted hover:text-foreground transition-colors"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
