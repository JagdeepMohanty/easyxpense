import React from 'react';

const Input = React.forwardRef(({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  required = false,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          w-full h-11 px-4
          bg-surface dark:bg-surface-dark
          border-0
          rounded-lg
          text-textPrimary dark:text-textPrimary-dark
          placeholder:text-textSecondary dark:placeholder:text-textSecondary-dark
          focus:outline-none focus:ring-2 focus:ring-emerald-500/40
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? 'ring-2 ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
