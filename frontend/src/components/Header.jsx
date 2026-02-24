import React from 'react';

const Header = ({ title }) => {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold text-textPrimary dark:text-textPrimary-dark">
        {title}
      </h1>
    </header>
  );
};

export default Header;
