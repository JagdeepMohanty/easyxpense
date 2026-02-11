import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          💰 EasyXpense
        </Link>
        <div className="nav-menu">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/friends" 
                className={`nav-link ${isActive('/friends') ? 'active' : ''}`}
              >
                Friends
              </Link>
              <Link 
                to="/add-expense" 
                className={`nav-link ${isActive('/add-expense') ? 'active' : ''}`}
              >
                Add Expense
              </Link>
              <Link 
                to="/debts" 
                className={`nav-link ${isActive('/debts') ? 'active' : ''}`}
              >
                Debts
              </Link>
              <Link 
                to="/history" 
                className={`nav-link ${isActive('/history') ? 'active' : ''}`}
              >
                History
              </Link>
            </>
          )}
          {isAuthenticated ? (
            <>
              <span className="nav-link" style={{ cursor: 'default', opacity: 0.7 }}>
                {user?.name}
              </span>
              <button 
                onClick={handleLogout}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className={`nav-link ${isActive('/login') ? 'active' : ''}`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;