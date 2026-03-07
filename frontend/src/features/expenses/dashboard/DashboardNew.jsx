import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, expensesAPI } from '../../../services/api';
import { formatCurrency } from '../../../utils/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { TrendingDown, TrendingUp, Wallet, Plus } from 'lucide-react';

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
          <div className="h-8 w-64 bg-card rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-card rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-card rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-card rounded-xl animate-pulse"></div>
          <div className="h-96 bg-card rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-main">
          {getGreeting()}, {user?.name} 👋
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Here's your balance overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-text-muted">You Owe</h3>
            <TrendingDown className="text-red-500" size={20} />
          </div>
          <p className="text-3xl font-semibold text-red-500">{formatCurrency(youOwe)}</p>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-text-muted">You Are Owed</h3>
            <TrendingUp className="text-primary" size={20} />
          </div>
          <p className="text-3xl font-semibold text-primary">{formatCurrency(youAreOwed)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-text-muted">Net Balance</h3>
            <Wallet className={netBalance >= 0 ? 'text-primary' : 'text-red-500'} size={20} />
          </div>
          <p className={`text-3xl font-semibold ${netBalance >= 0 ? 'text-primary' : 'text-red-500'}`}>
            {formatCurrency(netBalance)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-medium text-text-main mb-6">Monthly Expenses</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#E2E8F0'
                  }}
                />
                <Bar dataKey="amount" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center">
              <p className="text-text-main font-medium mb-1">No expense data yet</p>
              <p className="text-sm text-text-muted">Add your first expense to get started</p>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-medium text-text-main mb-6">Categories</h2>
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
                    backgroundColor: '#0F172A', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#E2E8F0'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center">
              <p className="text-text-main font-medium mb-1">No categories yet</p>
              <p className="text-sm text-text-muted">Add expenses to see breakdown</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-medium text-text-main mb-6">Recent Activity</h2>
        {expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.slice(0, 5).map((expense, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-text-main">{expense.description}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {expense.payer} paid {formatCurrency(expense.amount)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">{formatCurrency(expense.amount)}</span>
                </div>
                {idx < expenses.length - 1 && <div className="border-t border-slate-800"></div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-main font-medium mb-1">No expenses yet</p>
            <p className="text-sm text-text-muted mb-6">Add your first expense to get started</p>
            <Link
              to="/expenses/add"
              className="inline-flex items-center gap-2 px-5 h-11 bg-primary hover:bg-accent text-white rounded-lg font-medium transition-all duration-200"
            >
              <Plus size={20} />
              Add Expense
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
