import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

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
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/add-expense" 
            className={`nav-link ${isActive('/add-expense') ? 'active' : ''}`}
          >
            Add Expense
          </Link>
          <Link 
            to="/friends" 
            className={`nav-link ${isActive('/friends') ? 'active' : ''}`}
          >
            Friends
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;