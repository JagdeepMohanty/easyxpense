import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-main">
      <header className="bg-card border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            EasyXpense
          </h1>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-6 py-2 text-text-main font-medium hover:bg-primary/10 rounded-lg transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-primary hover:bg-accent text-white font-medium rounded-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-text-main mb-6">
          Split Expenses with Friends
        </h2>
        <p className="text-xl text-text-muted mb-10 max-w-2xl mx-auto">
          Track shared expenses, settle debts, and manage group payments effortlessly
        </p>
        <Link
          to="/register"
          className="inline-block px-8 py-4 bg-primary hover:bg-accent text-white text-lg font-semibold rounded-lg transition-all"
        >
          Start Splitting Now →
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-text-main mb-2">
              Add Expenses
            </h3>
            <p className="text-text-muted">
              Easily add shared expenses and split them among friends
            </p>
          </div>
          <div className="bg-card p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-text-main mb-2">
              Manage Friends
            </h3>
            <p className="text-text-muted">
              Add friends and keep track of shared expenses
            </p>
          </div>
          <div className="bg-card p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-text-main mb-2">
              Track Debts
            </h3>
            <p className="text-text-muted">
              See who owes what and settle up easily
            </p>
          </div>
          <div className="bg-card p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-text-main mb-2">
              Payment History
            </h3>
            <p className="text-text-muted">
              Keep track of all payments and settlements
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;