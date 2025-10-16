const Button = ({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  ...props
}) => {
  const baseClasses =
    'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
    secondary:
      'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary',
    accent: 'bg-accent text-white hover:bg-accent/90 focus:ring-accent',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
