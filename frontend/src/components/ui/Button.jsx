import React from 'react';

const Button = React.memo(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  icon = null,
  className = '',
  as: Component = 'button',
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 justify-center';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black hover:shadow-emerald-500/30',
    secondary: 'bg-[#0F172A] border border-emerald-500/20 text-textPrimary hover:border-emerald-400/40 hover:bg-emerald-500/5',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component 
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {icon && !loading && <span>{icon}</span>}
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
      {children}
    </Component>
  );
});

Button.displayName = 'Button';

export default Button;