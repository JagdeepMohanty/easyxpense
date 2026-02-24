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
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center gap-2 justify-center';
  
  const variantClasses = {
    primary: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm h-9',
    md: 'px-4 py-2 text-sm h-11',
    lg: 'px-6 py-3 text-base h-12'
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
