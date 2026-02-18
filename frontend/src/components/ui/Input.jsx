import React from 'react';

const Input = ({ 
  label,
  error,
  helper,
  className = '',
  ...props 
}) => {
  const inputClasses = [
    'w-full px-4 py-2 bg-[#020617] border rounded-lg text-textPrimary placeholder-textSecondary transition-all duration-200',
    error ? 'border-red-500 focus:border-red-400' : 'border-emerald-500/20 focus:border-emerald-400',
    'focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-textPrimary">{label}</label>}
      <input className={inputClasses} {...props} />
      {helper && <div className="text-xs text-textSecondary">{helper}</div>}
      {error && <div className="text-xs text-red-400 flex items-center gap-1">⚠️ {error}</div>}
    </div>
  );
};

export default Input;