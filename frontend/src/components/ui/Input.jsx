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
          w-full h-11 px-4 py-2
          bg-card dark:bg-card-dark
          border border-gray-300 dark:border-gray-600
          rounded-lg
          text-textPrimary dark:text-textPrimary-dark
          placeholder-textSecondary dark:placeholder-textSecondary-dark
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
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
