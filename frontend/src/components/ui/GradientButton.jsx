import React from 'react';
import { Link } from 'react-router-dom';

const GradientButton = ({ children, onClick, to, className = '', disabled = false, type = 'button' }) => {
  const baseClasses = "px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 bg-gradient-to-br from-accent-start via-accent-mid to-accent-end hover:shadow-glow hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";
  
  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${className}`}>
        {children}
      </Link>
    );
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default GradientButton;