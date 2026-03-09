import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, Users, UserPlus, Clock, Moon, Sun, LogOut } from 'lucide-react';

const Navbar = () => {
  const [showTooltip, setShowTooltip] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
    { path: '/friends', label: 'Friends', icon: Users },
    { path: '/groups', label: 'Groups', icon: UserPlus },
    { path: '/payments', label: 'History', icon: Clock },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0F172A]/60 border-b border-slate-700/40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/dashboard" 
            className="text-lg font-semibold tracking-wide bg-gradient-to-r from-[#10B981] to-[#34D399] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            EasyXpense
          </Link>

          <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <div key={link.path} className="relative">
                  <Link
                    to={link.path}
                    onMouseEnter={() => setShowTooltip(link.path)}
                    onMouseLeave={() => setShowTooltip(null)}
                    className={`
                      p-2 rounded-md transition-all duration-200
                      ${active 
                        ? 'text-[#10B981] bg-[#10B981]/10' 
                        : 'text-[#94A3B8] hover:text-[#10B981] hover:bg-[#10B981]/5'
                      }
                    `}
                    aria-label={link.label}
                  >
                    <Icon size={20} />
                  </Link>
                  {showTooltip === link.path && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#0F172A] text-[#E2E8F0] text-xs rounded-md px-2 py-1 shadow-md whitespace-nowrap pointer-events-none">
                      {link.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-md text-[#94A3B8] hover:text-[#10B981] hover:bg-[#10B981]/5 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-full flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                aria-label="User profile"
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-[#0F172A] rounded-xl shadow-xl py-2 z-20 border border-slate-700/40 backdrop-blur-md">
                    <div className="px-4 py-3 border-b border-slate-700/40">
                      <p className="text-sm font-medium text-[#E2E8F0]">{user?.name}</p>
                      <p className="text-xs text-[#94A3B8] mt-1">{user?.email || user?.phone}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-all duration-200 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
