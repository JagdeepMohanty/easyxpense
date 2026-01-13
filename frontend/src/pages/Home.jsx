import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <h1>Welcome to EasyXpense</h1>
        <p>Split expenses with friends easily and track who owes what</p>
        <div className="hero-buttons">
          <Link to="/dashboard" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/add-expense" className="btn btn-secondary">
            Add Expense
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Add Expenses</h3>
            <p>Easily add shared expenses and split them among friends</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Manage Friends</h3>
            <p>Add friends and keep track of shared expenses</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Debts</h3>
            <p>See who owes what and settle up easily</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Payment History</h3>
            <p>Keep track of all payments and settlements</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;