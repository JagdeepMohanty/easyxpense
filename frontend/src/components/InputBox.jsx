import React from 'react';

const InputBox = ({ 
  label,
  error,
  helper,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark">
          {label}
        </label>
      )}
      <input 
        className={`w-full bg-background dark:bg-background-dark border border-primary/20 rounded-lg px-4 py-3 text-textPrimary dark:text-textPrimary-dark placeholder-textSecondary dark:placeholder-textSecondary-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 ${error ? 'border-red-500' : ''} ${className}`}
        {...props} 
      />
      {helper && (
        <div className="text-xs text-textSecondary dark:text-textSecondary-dark">
          {helper}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-500 flex items-center gap-1">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default InputBox;