import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, expensesAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#7B5CFF', '#C4B5FD', '#FDBA74'];

const Dashboard = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);

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
        
        const total = (monthlyRes.data.data || []).reduce((sum, m) => sum + (m.amount || 0), 0);
        setTotalExpense(total);
      } catch (err) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-primarywhite">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-gap">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-primarywhite">Dashboard</h1>
          <p className="text-muted mt-2">Your financial overview</p>
        </div>
        <Link
          to="/add-expense"
          className="px-6 py-3 bg-cyber-gradient text-primarywhite rounded-2xl font-semibold hover:shadow-glow hover:scale-105 transition-all duration-200"
        >
          + Add Expense
        </Link>
      </div>

      <div className="grid lg:grid-cols-4 gap-gap">
        <div className="lg:col-span-3 space-y-gap">
          <div className="bg-offblack rounded-main p-6 shadow-cyber border border-white/5">
            <h2 className="text-xl font-bold text-primarywhite mb-6">Monthly Spending Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#A1A1A1" />
                <YAxis stroke="#A1A1A1" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D0D0D',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    color: '#FFFFFF'
                  }}
                />
                <Bar dataKey="amount" fill="#7B5CFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-offblack rounded-main p-6 shadow-cyber border border-white/5">
            <h2 className="text-xl font-bold text-primarywhite mb-6">Recent Transactions</h2>
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-pureblack rounded-2xl border border-white/5 hover:border-cyberpurple/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cyber-gradient flex items-center justify-center">
                      <span className="text-primarywhite text-xl">💰</span>
                    </div>
                    <div>
                      <p className="text-primarywhite font-semibold">{expense.description}</p>
                      <p className="text-muted text-sm">{expense.payer}</p>
                    </div>
                  </div>
                  <span className="text-primarywhite font-bold text-lg">{formatCurrency(expense.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-gap">
          <div className="bg-card-gradient rounded-main p-6 shadow-cyber shadow-glow">
            <h3 className="text-sm text-lavender mb-2">Total Monthly Expense</h3>
            <p className="text-4xl font-bold text-primarywhite">{formatCurrency(totalExpense)}</p>
          </div>

          <div className="bg-offblack rounded-main p-6 shadow-cyber border border-white/5">
            <h2 className="text-lg font-bold text-primarywhite mb-4">Category Distribution</h2>
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
                    backgroundColor: '#0D0D0D',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    color: '#FFFFFF'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.slice(0, 3).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <span className="text-muted text-sm">{cat.name}</span>
                  </div>
                  <span className="text-primarywhite text-sm font-semibold">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-offblack rounded-main p-6 shadow-cyber border border-cyberpurple/30">
            <h3 className="text-primarywhite font-bold mb-2">Track Group Expenses</h3>
            <p className="text-muted text-sm mb-4">Split bills with friends easily</p>
            <Link
              to="/groups"
              className="block w-full py-3 bg-cyber-gradient text-primarywhite rounded-xl text-center font-semibold hover:shadow-glow hover:scale-105 transition-all duration-200"
            >
              View Groups
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
