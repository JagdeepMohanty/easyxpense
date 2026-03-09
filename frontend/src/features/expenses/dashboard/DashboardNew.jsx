import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { analyticsAPI, expensesAPI } from '../../../services/api';
import { formatCurrency } from '../../../utils/currency';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import StatCard from '../../../components/dashboard/StatCard';
import IncomeExpenseChart from '../../../components/dashboard/IncomeExpenseChart';
import CategoryChart from '../../../components/dashboard/CategoryChart';
import RecentTransactions from '../../../components/dashboard/RecentTransactions';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [monthlyRes, categoryRes, expensesRes] = await Promise.all([
          analyticsAPI.getMonthlySummary(6),
          analyticsAPI.getCategoryBreakdown(),
          expensesAPI.getAll(null, 1, 10)
        ]);

        const monthlyDataRaw = monthlyRes.data.data || [];
        const expenses = expensesRes.data.data || [];
        
        // Calculate stats from expenses
        const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const totalIncome = 0; // Can be calculated if income data exists
        const totalBalance = totalIncome - totalExpenses;
        const savings = totalBalance;

        setStats({
          totalBalance,
          totalIncome,
          totalExpenses,
          savings
        });

        // Transform monthly data for income/expense chart
        const transformedMonthly = monthlyDataRaw.map(item => ({
          month: item.month,
          income: 0, // Add income calculation if available
          expense: item.amount || 0
        }));

        setMonthlyData(transformedMonthly);
        setCategoryData(categoryRes.data.data || []);
        
        // Transform expenses to transactions format
        const transactions = expenses.map(exp => ({
          ...exp,
          type: 'expense'
        }));
        setRecentTransactions(transactions);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#E2E8F0]">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Here's your financial overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={formatCurrency(stats.totalBalance)}
          icon={Wallet}
          loading={loading}
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(stats.totalIncome)}
          icon={TrendingUp}
          trend="up"
          trendValue="0%"
          loading={loading}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          icon={TrendingDown}
          loading={loading}
        />
        <StatCard
          title="Savings"
          value={formatCurrency(stats.savings)}
          icon={PiggyBank}
          loading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <IncomeExpenseChart data={monthlyData} loading={loading} />
        <CategoryChart data={categoryData} loading={loading} />
      </div>

      <RecentTransactions transactions={recentTransactions} loading={loading} />
    </div>
  );
};

export default Dashboard;
