import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expensesAPI, debtsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [expensesRes, debtsRes] = await Promise.all([
        expensesAPI.getAll(),
        debtsAPI.getAll()
      ]);
      
      setExpenses(expensesRes.data.slice(0, 5)); // Show only recent 5
      setDebts(debtsRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  const totalOwed = debts
    .filter(debt => debt.amount > 0)
    .reduce((sum, debt) => sum + debt.amount, 0);

  const totalOwe = debts
    .filter(debt => debt.amount < 0)
    .reduce((sum, debt) => sum + Math.abs(debt.amount), 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/add-expense" className="btn btn-primary">
          Add New Expense
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card positive">
          <h3>You are owed</h3>
          <p className="amount">{formatCurrency(totalOwed)}</p>
        </div>
        <div className="stat-card negative">
          <h3>You owe</h3>
          <p className="amount">{formatCurrency(totalOwe)}</p>
        </div>
        <div className="stat-card neutral">
          <h3>Total expenses</h3>
          <p className="amount">{expenses.length}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-expenses">
          <div className="section-header">
            <h2>Recent Expenses</h2>
            <Link to="/history" className="view-all">View All</Link>
          </div>
          {expenses.length === 0 ? (
            <p className="empty-state">No expenses yet. <Link to="/add-expense">Add your first expense</Link></p>
          ) : (
            <div className="expense-list">
              {expenses.map((expense) => (
                <div key={expense._id} className="expense-item">
                  <div className="expense-info">
                    <h4>{expense.description}</h4>
                    <p>Paid by: {expense.payer}</p>
                  </div>
                  <div className="expense-amount">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="debt-summary">
          <div className="section-header">
            <h2>Debt Summary</h2>
            <Link to="/debts" className="view-all">View All</Link>
          </div>
          {debts.length === 0 ? (
            <p className="empty-state">No debts to show</p>
          ) : (
            <div className="debt-list">
              {debts.slice(0, 5).map((debt) => (
                <div key={debt.friendId} className="debt-item">
                  <div className="debt-info">
                    <h4>{debt.friendName}</h4>
                  </div>
                  <div className={`debt-amount ${debt.amount > 0 ? 'positive' : 'negative'}`}>
                    {debt.amount > 0 ? 'owes you ' : 'you owe '}
                    {formatCurrency(Math.abs(debt.amount))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;