import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/dashboard': 'Dashboard',
      '/add-expense': 'Add Expense',
      '/friends': 'Friends',
      '/debts': 'Debt Tracker',
      '/history': 'Payment History',
    };
    return titles[path] || 'EasyXpense';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-30 bg-[#020617] border-b border-emerald-500/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-emerald-500/10 rounded-lg text-textPrimary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-textPrimary">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-4">
          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-emerald-500/10 rounded-xl transition-all"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center text-black font-semibold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block font-medium text-textPrimary">
                {user.name}
              </span>
              <svg
                className={`w-4 h-4 transition-transform text-textSecondary ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-[#0F172A] rounded-xl shadow-lg border border-emerald-500/10 py-2 z-20">
                  <div className="px-4 py-2 border-b border-emerald-500/10">
                    <p className="text-sm font-medium text-textPrimary">{user.name}</p>
                    <p className="text-xs text-textSecondary">{user.email || user.phone}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-emerald-500/5 transition-all"
                  >
                    🚪 Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;