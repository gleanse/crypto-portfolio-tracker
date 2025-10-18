const Button = ({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  ...props
}) => {
  const baseClasses =
    'px-8 py-4 font-semibold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group cursor-pointer';

  const variants = {
    primary: `
      bg-primary/90
      text-white 
      hover:bg-primary
      hover:scale-105
      active:scale-95
      border-2 border-primary/40
      rounded-xl
      shadow-md
      hover:shadow-lg
      hover:border-primary/60
      hover:shadow-primary/20
    `,
    secondary: `
      bg-secondary/90
      text-white 
      hover:bg-secondary
      hover:scale-105
      active:scale-95
      border-2 border-secondary/40
      rounded-xl
      shadow-md
      hover:shadow-lg
      hover:border-secondary/60
      hover:shadow-secondary/20
    `,
    accent: `
      bg-accent/90
      text-white 
      hover:bg-accent
      hover:scale-105
      active:scale-95
      border-2 border-accent/40
      rounded-xl
      shadow-md
      hover:shadow-lg
      hover:border-accent/60
      hover:shadow-accent/20
    `,
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
            Loading...
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
};

export default Button;
