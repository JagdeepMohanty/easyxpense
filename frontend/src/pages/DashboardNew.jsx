import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, expensesAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Header from '../components/Header';

const CHART_COLORS = ['#10B981', '#34D399', '#6EE7B7'];

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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
        <div className="text-textPrimary dark:text-textPrimary-dark">Loading...</div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Balance', value: formatCurrency(totalExpense) },
    { label: 'This Month', value: formatCurrency(monthlyData[monthlyData.length - 1]?.amount || 0) },
    { label: 'Friends', value: '12' }
  ];

  return (
    <div>
      <Header title="Dashboard" stats={stats} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <h3 className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-2">Friends Balance</h3>
          <p className="text-2xl font-bold text-primary">+{formatCurrency(1250)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark mb-6">Monthly Expense Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="month" stroke="#64748b" className="dark:stroke-slate-400" />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
              <Tooltip />
              <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-bold text-textPrimary dark:text-textPrimary-dark mb-4">Category Breakdown</h2>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark mb-6">Recent Expenses</h2>
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
        </div>

        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark mb-6">Friends Balance</h2>
          <div className="space-y-3">
            {[1,2,3,4,5].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-background dark:bg-background-dark rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                    J
                  </div>
                  <div>
                    <p className="font-medium text-textPrimary dark:text-textPrimary-dark">John Doe</p>
                    <p className="text-sm text-textSecondary dark:text-textSecondary-dark">Owes you</p>
                  </div>
                </div>
                <span className="font-bold text-primary">+₹250</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;