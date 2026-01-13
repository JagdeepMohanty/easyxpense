import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { debtsAPI, expensesAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/currency';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [debts, setDebts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        const [debtsRes, expensesRes] = await Promise.all([
          debtsAPI.getDebts(),
          expensesAPI.getExpenses()
        ]);
        setDebts(debtsRes.data);
        setExpenses(expensesRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (!user) return null;
  
  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}!</h1>
      <div className="dashboard-grid">
        <div className="debts-section">
          <h2>Your Debts</h2>
          {debts.length === 0 ? (
            <p>No debts to display.</p>
          ) : (
            debts.map((debt) => (
              <div key={debt.friendId} className="debt-card">
                <span className={debt.amount > 0 ? 'owe-you' : 'you-owe'}>
                  {debt.friendName}: {debt.amount > 0 ? 'Owes you' : 'You owe'} {formatCurrency(Math.abs(debt.amount))}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="expenses-section">
          <h2>Recent Expenses</h2>
          {expenses.length === 0 ? (
            <p>No recent expenses.</p>
          ) : (
            expenses.map((exp) => (
              <div key={exp._id} className="expense-card">
                <span>{exp.description}</span>
                <span>{formatCurrency(exp.amount)}</span>
                <span className="payer">Paid by: {exp.payer}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="actions">
        <button onClick={() => navigate('/create-expense')}>
          Add Expense
        </button>
        <button onClick={() => navigate('/settle')}>Settle Debt</button>
      </div>
    </div>
  );
};

export default Dashboard;