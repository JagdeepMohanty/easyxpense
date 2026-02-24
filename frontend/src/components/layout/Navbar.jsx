import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/expenses', label: 'Expenses' },
    { path: '/friends', label: 'Friends' },
    { path: '/groups', label: 'Groups' },
    { path: '/debts', label: 'Debts' },
    { path: '/payments', label: 'Payments' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200/10 dark:border-gray-700/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-semibold bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
              EasyXpense
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(link.path)
                    ? 'bg-emerald-500 text-white'
                    : 'text-textSecondary dark:text-textSecondary-dark hover:bg-emerald-500/10 hover:text-emerald-500'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? '🌞' : '🌙'}
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-textPrimary dark:text-textPrimary-dark">
                  {user?.name}
                </span>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-card dark:bg-card-dark rounded-xl shadow-lg py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-200/10 dark:border-gray-700/20">
                      <p className="text-sm font-medium text-textPrimary dark:text-textPrimary-dark">{user?.name}</p>
                      <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-1">{user?.email || user?.phone}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200/10 dark:border-gray-700/20">
            <div className="space-y-1 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive(link.path)
                      ? 'bg-emerald-500 text-white'
                      : 'text-textSecondary dark:text-textSecondary-dark hover:bg-emerald-500/10'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-200/10 dark:border-gray-700/20 my-2 pt-2">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-textPrimary dark:text-textPrimary-dark">{user?.name}</p>
                  <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-1">{user?.email || user?.phone}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
