import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ 
  title = 'Dashboard', 
  breadcrumbs = [],
  quickStats = null 
}) => {
  const location = useLocation();
  
  const getDefaultBreadcrumbs = () => {
    const path = location.pathname;
    const routes = {
      '/dashboard': [{ label: 'Dashboard', path: '/dashboard' }],
      '/add-expense': [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Expenses', path: '/add-expense' }],
      '/expenses': [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Expenses', path: '/expenses' }],
      '/groups': [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Groups', path: '/groups' }],
      '/friends': [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Friends', path: '/friends' }],
      '/debts': [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Debt Tracker', path: '/debts' }],
      '/history': [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Reports', path: '/history' }],
    };
    return routes[path] || [{ label: 'Dashboard', path: '/dashboard' }];
  };

  const displayBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : getDefaultBreadcrumbs();

  return (
    <header className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">
            {title}
          </h1>
          <nav className="flex items-center gap-2 mt-2 text-sm">
            {displayBreadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && (
                  <span className="text-textSecondary dark:text-textSecondary-dark">/</span>
                )}
                {index === displayBreadcrumbs.length - 1 ? (
                  <span className="text-primary font-medium">{crumb.label}</span>
                ) : (
                  <Link 
                    to={crumb.path} 
                    className="text-textSecondary dark:text-textSecondary-dark hover:text-primary transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
        
        {quickStats && (
          <div className="flex items-center gap-4">
            {quickStats}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
