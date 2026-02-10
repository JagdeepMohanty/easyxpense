import React from 'react';

/* FORM UX: Simplified Input component with static labels only */
const Input = ({ 
  label,
  error,
  helper,
  className = '',
  ...props 
}) => {
  const inputClasses = [
    'form-input',
    error ? 'form-error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input className={inputClasses} {...props} />
      {helper && <div className="form-helper">{helper}</div>}
      {error && <div className="form-error-message">⚠️ {error}</div>}
    </div>
  );
};

export default Input;