import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { expensesAPI, debtsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import SummaryCard from '../components/dashboard/SummaryCard';
import ExpenseTable from '../components/dashboard/ExpenseTable';
import Charts from '../components/dashboard/Charts';
import Pagination from '../components/dashboard/Pagination';
import ErrorState from '../components/ui/ErrorState';
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [expensesRes, debtsRes] = await Promise.all([
        expensesAPI.getAll(null, currentPage, itemsPerPage),
        debtsAPI.getAll()
      ]);
      
      const expensesData = expensesRes.data.data || expensesRes.data;
      const pagination = expensesRes.data.pagination;
      
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setTotalPages(pagination?.totalPages || 1);
      
      const debtsData = debtsRes.data.debts || debtsRes.data;
      const balancesData = debtsRes.data.balances || {};
      
      setDebts(Array.isArray(debtsData) ? debtsData : []);
      setBalances(balancesData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate summary statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const youOwe = Object.values(balances).reduce((sum, balance) => 
    balance < 0 ? sum + Math.abs(balance) : sum, 0
  );
  const youAreOwed = Object.values(balances).reduce((sum, balance) => 
    balance > 0 ? sum + balance : sum, 0
  );
  const netBalance = youAreOwed - youOwe;

  // Generate chart data
  const monthlyData = [
    { month: 'Jan', amount: 12000 },
    { month: 'Feb', amount: 19000 },
    { month: 'Mar', amount: 15000 },
    { month: 'Apr', amount: 25000 },
    { month: 'May', amount: 22000 },
    { month: 'Jun', amount: totalExpenses || 18000 },
  ];

  const categoryData = [
    { name: 'Food', value: 8500 },
    { name: 'Transport', value: 4200 },
    { name: 'Entertainment', value: 3800 },
    { name: 'Shopping', value: 5600 },
    { name: 'Others', value: 2900 },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Your expense overview at a glance</p>
        </div>
        <Link
          to="/add-expense"
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-soft flex items-center gap-2"
        >
          <span>➕</span>
          Add Expense
        </Link>
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
            value={expenses.length}
            icon="📊"
            color="purple"
          />
        </div>
      </div>

      {/* Charts */}
      <Charts monthlyData={monthlyData} categoryData={categoryData} />

      {/* Debts Section */}
      {debts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Settlements</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Clear these to balance your account</p>
            </div>
            <Link
              to="/debts"
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
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
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                      <p className="font-medium text-gray-900 dark:text-white">
                        {userOwes ? `You owe ${debt.creditor}` : `${debt.debtor} owes you`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(debt.amount)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/debts"
                    className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium transition-all"
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
      <ExpenseTable expenses={expenses} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Dashboard;