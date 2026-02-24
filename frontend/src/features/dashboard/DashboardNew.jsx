import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, expensesAPI, friendsAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const CHART_COLORS = ['#10B981', '#34D399', '#6EE7B7'];

const Dashboard = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const youOwe = 1250;
  const youAreOwed = 3400;
  const netBalance = youAreOwed - youOwe;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [monthlyRes, categoryRes, expensesRes] = await Promise.all([
          analyticsAPI.getMonthlySummary(6),
          analyticsAPI.getCategoryBreakdown(),
          expensesAPI.getAll(null, 1, 10)
        ]);

        setMonthlyData(monthlyRes.data.data || []);
        setCategoryData(categoryRes.data.data || []);
        setExpenses(expensesRes.data.data || []);
      } catch (err) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-card dark:bg-card-dark rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-card dark:bg-card-dark rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-card dark:bg-card-dark rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-card dark:bg-card-dark rounded-xl animate-pulse"></div>
          <div className="h-96 bg-card dark:bg-card-dark rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-textPrimary dark:text-textPrimary-dark">
          {getGreeting()}, {user?.name} 👋
        </h1>
        <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-1">
          Here's your balance overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 dark:from-red-500/20 dark:to-red-600/10 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
          <h3 className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-2">You Owe</h3>
          <p className="text-3xl font-semibold text-red-500">{formatCurrency(youOwe)}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
          <h3 className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-2">You Are Owed</h3>
          <p className="text-3xl font-semibold text-emerald-500">{formatCurrency(youAreOwed)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
          <h3 className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-2">Net Balance</h3>
          <p className={`text-3xl font-semibold ${netBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrency(netBalance)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card dark:bg-card-dark rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-medium text-textPrimary dark:text-textPrimary-dark mb-6">Monthly Expenses</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#E5E7EB'
                  }}
                />
                <Bar dataKey="amount" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center">
              <p className="text-textPrimary dark:text-textPrimary-dark font-medium mb-1">No expense data yet</p>
              <p className="text-sm text-textSecondary dark:text-textSecondary-dark">Add your first expense to get started</p>
            </div>
          )}
        </div>

        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-medium text-textPrimary dark:text-textPrimary-dark mb-6">Categories</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#E5E7EB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center">
              <p className="text-textPrimary dark:text-textPrimary-dark font-medium mb-1">No categories yet</p>
              <p className="text-sm text-textSecondary dark:text-textSecondary-dark">Add expenses to see breakdown</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-medium text-textPrimary dark:text-textPrimary-dark mb-6">Recent Activity</h2>
        {expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.slice(0, 5).map((expense, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-textPrimary dark:text-textPrimary-dark">{expense.description}</p>
                    <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-1">
                      {expense.payer} paid {formatCurrency(expense.amount)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-emerald-500">{formatCurrency(expense.amount)}</span>
                </div>
                {idx < expenses.length - 1 && <div className="border-t border-slate-700/40"></div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-textPrimary dark:text-textPrimary-dark font-medium mb-1">No expenses yet</p>
            <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-6">Add your first expense to get started</p>
            <Link
              to="/add-expense"
              className="inline-block px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-all duration-200"
            >
              Add Expense
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
