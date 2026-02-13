import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/add-expense', label: 'Expenses', icon: '💰' },
    { path: '/groups', label: 'Groups', icon: '👥' },
    { path: '/history', label: 'Reports', icon: '📈' },
  ];

  if (!user) return null;

  return (
    <aside className="w-64 bg-pureblack h-screen fixed left-0 top-0 flex flex-col border-r border-white/5">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-2xl font-bold text-primarywhite">EasyXpense</h1>
        <p className="text-xs text-muted mt-1">Cyber Edition</p>
      </div>

      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyber-gradient flex items-center justify-center text-primarywhite font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primarywhite truncate">{user.name}</p>
            <p className="text-xs text-muted truncate">{user.email || user.phone}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                isActive
                  ? 'bg-cyber-gradient text-primarywhite font-bold shadow-glow'
                  : 'text-muted hover:text-primarywhite hover:bg-offblack'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-muted hover:text-primarywhite hover:bg-offblack transition-all"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
