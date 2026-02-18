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
    <aside className="w-64 bg-[#020617] h-screen fixed left-0 top-0 flex flex-col border-r border-emerald-500/10">
      <div className="p-6 border-b border-emerald-500/10">
        <h1 className="text-2xl font-bold text-textPrimary">EasyXpense</h1>
        <p className="text-xs text-textSecondary mt-1">Dark Emerald</p>
      </div>

      <div className="p-4 border-b border-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center text-black font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-textPrimary truncate">{user.name}</p>
            <p className="text-xs text-textSecondary truncate">{user.email || user.phone}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                  : 'text-textSecondary hover:text-emerald-400 hover:bg-emerald-500/5'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-emerald-500/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-textSecondary hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
