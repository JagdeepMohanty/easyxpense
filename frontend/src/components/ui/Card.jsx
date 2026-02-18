import React from 'react';

const Card = ({ children, className = '', hover = true, ...props }) => {
  const classes = [
    'bg-[#0F172A] rounded-xl shadow-lg border border-emerald-500/10',
    hover ? 'hover:border-emerald-400/30 hover:shadow-emerald-500/10' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-6 pb-0 ${className}`} {...props}>
    {children}
  </div>
);

const CardBody = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;