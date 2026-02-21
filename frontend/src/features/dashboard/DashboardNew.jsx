import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, expensesAPI, friendsAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Header from '../../components/Header';

const CHART_COLORS = ['#10B981', '#34D399', '#6EE7B7'];

const Dashboard = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [friends, setFriends] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [monthlyRes, categoryRes, expensesRes, friendsRes] = await Promise.all([
          analyticsAPI.getMonthlySummary(6),
          analyticsAPI.getCategoryBreakdown(),
          expensesAPI.getAll(null, 1, 10),
          friendsAPI.getAll(null, 1, 100)
        ]);

        setMonthlyData(monthlyRes.data.data || []);
        setCategoryData(categoryRes.data.data || []);
        setExpenses(expensesRes.data.data || []);
        setFriends(friendsRes.data.data || []);
        
        const total = (monthlyRes.data.data || []).reduce((sum, m) => sum + (m.amount || 0), 0);
        setTotalExpense(total);
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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
        <div className="text-textPrimary dark:text-textPrimary-dark">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-2">Total Balance</h3>
          <p className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">{formatCurrency(totalExpense)}</p>
        </div>
        
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">{formatCurrency(totalExpense)}</p>
        </div>
        
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-2">This Month</h3>
          <p className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">{formatCurrency(monthlyData[monthlyData.length - 1]?.amount || 0)}</p>
        </div>
        
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-2">Friends</h3>
          <p className="text-2xl font-bold text-primary">{friends.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark mb-6">Monthly Expense Chart</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="month" stroke="#64748b" className="dark:stroke-slate-400" />
                <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    border: '1px solid #10B981',
                    borderRadius: '8px',
                    color: '#E2E8F0'
                  }}
                />
                <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-textSecondary dark:text-textSecondary-dark">
              No expense data yet
            </div>
          )}
        </div>

        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-bold text-textPrimary dark:text-textPrimary-dark mb-4">Category Breakdown</h2>
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
                    border: '1px solid #10B981',
                    borderRadius: '8px',
                    color: '#E2E8F0'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-textSecondary dark:text-textSecondary-dark text-sm">
              No categories yet
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark mb-6">Recent Expenses</h2>
          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background dark:bg-background-dark rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-white text-sm">💰</span>
                    </div>
                    <div>
                      <p className="font-medium text-textPrimary dark:text-textPrimary-dark">{expense.description}</p>
                      <p className="text-sm text-textSecondary dark:text-textSecondary-dark">{expense.payer}</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary">{formatCurrency(expense.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-textSecondary dark:text-textSecondary-dark mb-4">No expenses yet</p>
              <Link
                to="/add-expense"
                className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Add Expense
              </Link>
            </div>
          )}
        </div>

        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark mb-6">Friends</h2>
          {friends.length > 0 ? (
            <div className="space-y-3">
              {friends.slice(0, 5).map((friend) => (
                <div key={friend._id} className="flex items-center justify-between p-3 bg-background dark:bg-background-dark rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-textPrimary dark:text-textPrimary-dark">{friend.name}</p>
                      <p className="text-sm text-textSecondary dark:text-textSecondary-dark">Friend</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-textPrimary dark:text-textPrimary-dark font-medium mb-1">You don't have any friends yet</p>
              <p className="text-textSecondary dark:text-textSecondary-dark text-sm mb-4">Add friends to start splitting expenses.</p>
              <Link
                to="/friends"
                className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Add Friends
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
