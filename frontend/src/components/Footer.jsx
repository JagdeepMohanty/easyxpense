import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card dark:bg-card-dark border-t border-primary/10 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-textSecondary dark:text-textSecondary-dark">
            <span className="text-sm font-medium">© {currentYear} EasyXpense</span>
            <span className="hidden md:inline text-primary">•</span>
            <span className="hidden md:inline text-sm">Built with ❤️</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-textSecondary dark:text-textSecondary-dark">
            <span>Track your expenses effortlessly</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
