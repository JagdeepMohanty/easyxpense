import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, debtsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import SummaryCard from '../components/dashboard/SummaryCard';
import ExpenseTable from '../components/dashboard/ExpenseTable';
import Charts from '../components/dashboard/Charts';
import ErrorState from '../components/ui/ErrorState';
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton';
import GradientButton from '../components/ui/GradientButton';

const Dashboard = () => {
  const [debts, setDebts] = useState([]);
  const [balances, setBalances] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [debtsRes, monthlyRes, categoryRes] = await Promise.all([
        debtsAPI.getAll(),
        analyticsAPI.getMonthlySummary(6),
        analyticsAPI.getCategoryBreakdown()
      ]);
      
      const debtsData = debtsRes.data.debts || debtsRes.data;
      const balancesData = debtsRes.data.balances || {};
      
      setDebts(Array.isArray(debtsData) ? debtsData : []);
      setBalances(balancesData);
      
      setMonthlyData(monthlyRes.data.data || []);
      setCategoryData(categoryRes.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate summary statistics
  const totalExpenses = monthlyData.reduce((sum, m) => sum + (m.amount || 0), 0);
  const youOwe = Object.values(balances).reduce((sum, balance) => 
    balance < 0 ? sum + Math.abs(balance) : sum, 0
  );
  const youAreOwed = Object.values(balances).reduce((sum, balance) => 
    balance > 0 ? sum + balance : sum, 0
  );
  const netBalance = youAreOwed - youOwe;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Error loading dashboard"
        message={error}
        onRetry={fetchDashboardData}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-darktext">Dashboard</h1>
          <p className="text-darkmuted mt-1">Your expense overview at a glance</p>
        </div>
        <GradientButton to="/add-expense">
          <span>➕</span>
          Add Expense
        </GradientButton>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
        <div className="hover-lift">
          <SummaryCard
            title="Net Balance"
            value={formatCurrency(netBalance)}
            icon="💰"
            color="primary"
            trend={netBalance > 0 ? 'up' : netBalance < 0 ? 'down' : 'neutral'}
            trendValue={netBalance > 0 ? 'Positive' : netBalance < 0 ? 'Negative' : 'Neutral'}
          />
        </div>
        <div className="hover-lift">
          <SummaryCard
            title="You Owe"
            value={formatCurrency(youOwe)}
            icon="💸"
            color="orange"
            trend={youOwe > 0 ? 'down' : 'neutral'}
            trendValue={youOwe > 0 ? 'Outstanding' : 'Clear'}
          />
        </div>
        <div className="hover-lift">
          <SummaryCard
            title="You Are Owed"
            value={formatCurrency(youAreOwed)}
            icon="💵"
            color="green"
            trend={youAreOwed > 0 ? 'up' : 'neutral'}
            trendValue={youAreOwed > 0 ? 'To collect' : 'None'}
          />
        </div>
        <div className="hover-lift">
          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon="📊"
            color="purple"
          />
        </div>
      </div>

      {/* Charts */}
      <Charts monthlyData={monthlyData} categoryData={categoryData} />

      {/* Debts Section */}
      {debts.length > 0 && (
        <div className="bg-darkcard rounded-xl shadow-soft border border-darkborder p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-darktext">Pending Settlements</h2>
              <p className="text-sm text-darkmuted mt-1">Clear these to balance your account</p>
            </div>
            <Link
              to="/debts"
              className="text-accent-mid hover:underline text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {debts.slice(0, 5).map((debt, index) => {
              const userOwes = debt.debtor !== debt.creditor;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-darksecondary rounded-xl hover:bg-darkbg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      userOwes
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-600'
                    }`}>
                      {userOwes ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className="font-medium text-darktext">
                        {userOwes ? `You owe ${debt.creditor}` : `${debt.debtor} owes you`}
                      </p>
                      <p className="text-sm text-darkmuted">
                        {formatCurrency(debt.amount)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/debts"
                    className="px-4 py-2 bg-darkcard hover:bg-darksecondary border border-darkborder rounded-xl text-sm font-medium transition-all text-darktext"
                  >
                    Settle
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense Table */}
      <ExpenseTable expenses={[]} />
    </div>
  );
};

export default Dashboard;