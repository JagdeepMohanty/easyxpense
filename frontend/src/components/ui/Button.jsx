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
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    loading ? 'btn-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component 
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      {!loading && children}
    </Component>
  );
});

Button.displayName = 'Button';

export default Button;