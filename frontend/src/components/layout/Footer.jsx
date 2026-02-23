import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-card dark:bg-card-dark border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm text-textSecondary dark:text-textSecondary-dark">
          <p>EasyXpense © 2024</p>
          <p className="mt-1">Built with React + Flask + MongoDB</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
