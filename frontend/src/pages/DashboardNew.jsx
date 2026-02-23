import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expensesAPI, friendsAPI, groupsAPI, debtsAPI, analyticsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import MainLayout from '../layouts/MainLayout';
import EmptyState from '../components/ui/EmptyState';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalExpenses: 0, totalFriends: 0, totalGroups: 0, youOwe: 0, youAreOwed: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [expensesRes, friendsRes, groupsRes, debtsRes, monthlyRes, categoryRes] = await Promise.all([
        expensesAPI.getAll('', 1, 5).catch(() => ({ data: { data: [], total: 0 } })),
        friendsAPI.getAll('', 1, 100).catch(() => ({ data: { friends: [] } })),
        groupsAPI.getAll().catch(() => ({ data: { groups: [] } })),
        debtsAPI.getAll().catch(() => ({ data: { debts: [] } })),
        analyticsAPI.getMonthlySummary(6).catch(() => ({ data: { monthly: [] } })),
        analyticsAPI.getCategoryBreakdown().catch(() => ({ data: { categories: [] } })),
      ]);

      // Calculate statistics
      const expenses = expensesRes.data.data || [];
      const friends = friendsRes.data.friends || [];
      const groups = groupsRes.data.groups || [];
      const debts = debtsRes.data.debts || [];

      const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      
      const youOwe = debts
        .filter(d => d.debtor === 'You')
        .reduce((sum, d) => sum + (d.amount || 0), 0);
      
      const youAreOwed = debts
        .filter(d => d.creditor === 'You')
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      setStats({
        totalExpenses,
        totalFriends: friends.length,
        totalGroups: groups.length,
        youOwe,
        youAreOwed,
      });

      setRecentExpenses(expenses);
      setMonthlyData(monthlyRes.data.monthly || []);
      setCategoryData(categoryRes.data.categories || []);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const hasData = stats.totalExpenses > 0 || stats.totalFriends > 0 || stats.totalGroups > 0;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary dark:text-textPrimary-dark">Dashboard</h1>
            <p className="text-textSecondary dark:text-textSecondary-dark mt-1">Overview of your expenses and debts</p>
          </div>
          <button
            onClick={() => navigate('/expenses/add')}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
          >
            + Add Expense
          </button>
        </div>

        {!hasData ? (
          <EmptyState
            icon="📊"
            title="Welcome to EasyXpense!"
            description="Start by adding your first expense or friend to see your dashboard come to life"
            action={() => navigate('/expenses/add')}
            actionLabel="Add First Expense"
          />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-2">Total Expenses</p>
                <p className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">{formatCurrency(stats.totalExpenses)}</p>
              </div>
              <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-2">Total Friends</p>
                <p className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">{stats.totalFriends}</p>
              </div>
              <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-2">Total Groups</p>
                <p className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">{stats.totalGroups}</p>
              </div>
              <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-red-200 dark:border-red-800">
                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-2">You Owe</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(stats.youOwe)}</p>
              </div>
              <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-green-200 dark:border-green-800">
                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-2">You Are Owed</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.youAreOwed)}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Chart */}
              {monthlyData.length > 0 && (
                <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark mb-4">Monthly Expenses</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Category Chart */}
              {categoryData.length > 0 && (
                <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark mb-4">Category Breakdown</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Recent Expenses */}
            {recentExpenses.length > 0 && (
              <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark">Recent Expenses</h2>
                  <button
                    onClick={() => navigate('/expenses')}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id || expense._id} className="flex justify-between items-center p-3 bg-background dark:bg-background-dark rounded-lg">
                      <div>
                        <p className="font-medium text-textPrimary dark:text-textPrimary-dark">{expense.description}</p>
                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">{expense.category}</p>
                      </div>
                      <p className="font-bold text-primary">{formatCurrency(expense.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
