import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expensesAPI, debtsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FIX: Fetch data on mount and when navigating back to this page
  useEffect(() => {
    fetchDashboardData();
  }, []); // Empty deps is correct - fetchDashboardData is stable

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [expensesRes, debtsRes] = await Promise.all([
        expensesAPI.getAll(),
        debtsAPI.getAll()
      ]);
      
      // FIX: Handle API response - data might be nested or direct array
      const expensesData = Array.isArray(expensesRes.data) ? expensesRes.data : [];
      setExpenses(expensesData.slice(0, 5)); // Show only recent 5
      
      // FIX: Handle both optimized and legacy debt response formats
      const debtsData = debtsRes.data.debts || debtsRes.data;
      const balancesData = debtsRes.data.balances || {};
      
      setDebts(Array.isArray(debtsData) ? debtsData : []);
      setBalances(balancesData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <span>⚠️</span>
        <div>
          <strong>Error loading dashboard</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const youOwe = Object.values(balances).reduce((sum, balance) => 
    balance < 0 ? sum + Math.abs(balance) : sum, 0
  );
  const youAreOwed = Object.values(balances).reduce((sum, balance) => 
    balance > 0 ? sum + balance : sum, 0
  );

  return (
    <div className="dashboard">
      {/* LAYOUT: Page header with primary action */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Your expense overview at a glance</p>
        </div>
        <Button 
          as={Link} 
          to="/add-expense" 
          size="lg"
          icon="💰"
        >
          Add Expense
        </Button>
      </div>

      {/* LAYOUT: Top - Summary cards (max 3 for clarity) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="You Owe"
          value={formatCurrency(youOwe)}
          icon="💸"
          changeType={youOwe > 0 ? 'negative' : 'neutral'}
          change={youOwe > 0 ? 'Outstanding' : 'All clear'}
        />
        
        <StatCard
          title="You Are Owed"
          value={formatCurrency(youAreOwed)}
          icon="💰"
          changeType={youAreOwed > 0 ? 'positive' : 'neutral'}
          change={youAreOwed > 0 ? 'To collect' : 'Nothing owed'}
        />
        
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon="📊"
          change={`${expenses.length} recorded`}
        />
      </div>

      {/* LAYOUT: Middle - Debts requiring action */}
      {debts.length > 0 && (
        <Card className="mb-8">
          <Card.Header>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Debts Requiring Action</h2>
                <p className="text-sm text-gray-600 mt-1">Settle these to clear your balance</p>
              </div>
              <Link to="/debts" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All →
              </Link>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              {debts.slice(0, 5).map((debt, index) => {
                // UX: Determine if current user owes or is owed
                const userOwes = debt.debtor !== debt.creditor;
                const debtText = userOwes 
                  ? `You owe ${debt.creditor} ${formatCurrency(debt.amount)}`
                  : `${debt.debtor} owes you ${formatCurrency(debt.amount)}`;
                
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      {/* UX: Icon indicates direction without relying on color alone */}
                      <div className="text-2xl">
                        {userOwes ? '⬆️' : '⬇️'}
                      </div>
                      <div>
                        {/* UX: Clear sentence format */}
                        <p className="font-medium text-gray-900">{debtText}</p>
                        <p className="text-sm text-gray-600">
                          {userOwes ? 'You need to pay' : 'You will receive'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      as={Link} 
                      to="/debts" 
                      variant="secondary" 
                      size="sm"
                    >
                      Settle
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* LAYOUT: Bottom - Recent history */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
              <p className="text-sm text-gray-600 mt-1">Your latest transactions</p>
            </div>
            <Link to="/history" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All →
            </Link>
          </div>
        </Card.Header>
        <Card.Body>
          {expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <div className="empty-state-title">You're all set!</div>
              <div className="empty-state-description">
                No expenses yet. Add your first one to start tracking spending with friends.
              </div>
              <Button as={Link} to="/add-expense" className="mt-4">
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div 
                  key={expense._id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-semibold">
                        {expense.payer?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{expense.description}</h4>
                      <p className="text-sm text-gray-600">
                        Paid by {expense.payer} • {expense.participants?.length || 0} people
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;