import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card dark:bg-card-dark border-t border-gray-200/10 dark:border-gray-700/20 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center text-sm text-textSecondary dark:text-textSecondary-dark">
          <p>EasyXpense © {currentYear}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
