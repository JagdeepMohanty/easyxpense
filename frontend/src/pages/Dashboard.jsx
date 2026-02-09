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
  const netBalance = youAreOwed - youOwe;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your expense overview.</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon="📊"
          change={`${expenses.length} expenses`}
        />
        
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
          title="Net Balance"
          value={formatCurrency(Math.abs(netBalance))}
          icon={netBalance >= 0 ? "📈" : "📉"}
          changeType={netBalance > 0 ? 'positive' : netBalance < 0 ? 'negative' : 'neutral'}
          change={netBalance > 0 ? 'You are owed' : netBalance < 0 ? 'You owe' : 'Balanced'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expenses */}
        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
              <Link to="/history" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All →
              </Link>
            </div>
          </Card.Header>
          <Card.Body>
            {expenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-title">No expenses yet</div>
                <div className="empty-state-description">
                  Start by adding your first expense to track spending with friends.
                </div>
                <Button as={Link} to="/add-expense" className="mt-4">
                  Add First Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {expense.payer?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{expense.description}</h4>
                        <p className="text-sm text-gray-500">Paid by {expense.payer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {expense.participants?.length || 0} people
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Pending Settlements */}
        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Pending Settlements</h2>
              <Link to="/debts" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All →
              </Link>
            </div>
          </Card.Header>
          <Card.Body>
            {debts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎉</div>
                <div className="empty-state-title">All settled up!</div>
                <div className="empty-state-description">
                  No outstanding debts. Everyone is square!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {debts.slice(0, 5).map((debt, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center">
                          <span className="text-danger-600 text-sm font-semibold">
                            {debt.debtor?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                          <span className="text-success-600 text-sm font-semibold">
                            {debt.creditor?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {debt.debtor} owes {debt.creditor}
                        </h4>
                      </div>
                    </div>
                    <div className="font-semibold text-danger-600">
                      {formatCurrency(debt.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <Card.Body>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button as={Link} to="/add-expense" variant="primary" className="flex-col h-20">
              <span className="text-2xl mb-1">💰</span>
              Add Expense
            </Button>
            <Button as={Link} to="/friends" variant="secondary" className="flex-col h-20">
              <span className="text-2xl mb-1">👥</span>
              Manage Friends
            </Button>
            <Button as={Link} to="/debts" variant="secondary" className="flex-col h-20">
              <span className="text-2xl mb-1">⚖️</span>
              View Debts
            </Button>
            <Button as={Link} to="/history" variant="secondary" className="flex-col h-20">
              <span className="text-2xl mb-1">📋</span>
              View History
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;