import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center text-sm text-text-muted">
          <p>EasyXpense © {currentYear}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
