import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { groupsAPI, groupTransactionsAPI, analyticsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import GradientButton from '../components/ui/GradientButton';
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

const COLORS = ['#7C5CFF', '#8B5CF6', '#A855F7', '#C084FC', '#E9D5FF'];

const GroupDetails = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({});
  const [chartData, setChartData] = useState({ member_spending: [], category_split: [] });
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    total_amount: '',
    paid_by: '',
    split_type: 'equal',
    category: 'Others',
    splits: []
  });

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const [groupRes, txnRes, balRes, chartRes, summaryRes] = await Promise.all([
        groupsAPI.getById(groupId),
        groupTransactionsAPI.getAll(groupId),
        groupTransactionsAPI.getBalances(groupId),
        analyticsAPI.getGroupChartData(groupId),
        analyticsAPI.getGroupSummary(groupId)
      ]);

      setGroup(groupRes.data.group || groupRes.data);
      setTransactions(txnRes.data.data || []);
      setBalances(balRes.data.balances || {});
      setChartData(chartRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      const members = group.members || [];
      const splits = members.map(m => ({
        user_id: m,
        percentage: formData.split_type === 'percentage' ? 100 / members.length : undefined
      }));

      await groupTransactionsAPI.create(groupId, {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        splits
      });

      setShowModal(false);
      setFormData({
        description: '',
        total_amount: '',
        paid_by: '',
        split_type: 'equal',
        category: 'Others',
        splits: []
      });
      fetchGroupData();
    } catch (err) {
      alert(err.message || 'Failed to create transaction');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Error loading group" message={error} onRetry={fetchGroupData} />;
  }

  if (!group) {
    return <ErrorState title="Group not found" message="This group does not exist" />;
  }

  const debtsList = Object.entries(balances)
    .filter(([_, balance]) => balance !== 0)
    .map(([member, balance]) => ({
      member,
      amount: Math.abs(balance),
      type: balance > 0 ? 'owed' : 'owes'
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <Link to="/groups" className="text-accent-mid hover:underline text-sm mb-2 inline-block">
            ← Back to Groups
          </Link>
          <h1 className="text-3xl font-bold text-darktext">{group.name}</h1>
          <p className="text-darkmuted mt-1">Code: {group.group_code}</p>
        </div>
        <GradientButton onClick={() => setShowModal(true)}>
          <span>➕</span>
          Add Expense
        </GradientButton>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-darkcard rounded-xl p-6 border border-darkborder">
          <div className="text-darkmuted text-sm mb-2">Total Expenses</div>
          <div className="text-2xl font-bold text-darktext">{formatCurrency(summary.total_expense || 0)}</div>
        </div>
        <div className="bg-darkcard rounded-xl p-6 border border-darkborder">
          <div className="text-darkmuted text-sm mb-2">Transactions</div>
          <div className="text-2xl font-bold text-darktext">{summary.total_transactions || 0}</div>
        </div>
        <div className="bg-darkcard rounded-xl p-6 border border-darkborder">
          <div className="text-darkmuted text-sm mb-2">Members</div>
          <div className="text-2xl font-bold text-darktext">{group.members?.length || 0}</div>
        </div>
      </div>

      {debtsList.length > 0 && (
        <div className="bg-darkcard rounded-xl p-6 border border-darkborder">
          <h2 className="text-lg font-semibold text-darktext mb-4">Member Balances</h2>
          <div className="space-y-3">
            {debtsList.map((debt, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-darksecondary rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    debt.type === 'owed' ? 'bg-green-900/20 text-green-500' : 'bg-orange-900/20 text-orange-500'
                  }`}>
                    {debt.type === 'owed' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="font-medium text-darktext">{debt.member}</p>
                    <p className="text-sm text-darkmuted">
                      {debt.type === 'owed' ? 'Gets back' : 'Owes'}
                    </p>
                  </div>
                </div>
                <div className="text-lg font-semibold text-darktext">{formatCurrency(debt.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-darkcard rounded-xl p-6 border border-darkborder">
          <h2 className="text-lg font-semibold text-darktext mb-4">Member Spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.member_spending || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#23283B" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #23283B', borderRadius: '8px' }} />
              <Bar dataKey="amount" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C5CFF" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-darkcard rounded-xl p-6 border border-darkborder">
          <h2 className="text-lg font-semibold text-darktext mb-4">Category Split</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.category_split || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {(chartData.category_split || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #23283B', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-darkcard rounded-xl p-6 border border-darkborder">
        <h2 className="text-lg font-semibold text-darktext mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-darkmuted text-center py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-darkborder">
                  <th className="text-left py-3 px-4 text-darkmuted font-medium">Description</th>
                  <th className="text-left py-3 px-4 text-darkmuted font-medium">Paid By</th>
                  <th className="text-left py-3 px-4 text-darkmuted font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-darkmuted font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-darkmuted font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn._id} className="border-b border-darkborder hover:bg-darksecondary">
                    <td className="py-3 px-4 text-darktext">{txn.description}</td>
                    <td className="py-3 px-4 text-darktext">{txn.paid_by}</td>
                    <td className="py-3 px-4 text-darktext font-semibold">{formatCurrency(txn.total_amount)}</td>
                    <td className="py-3 px-4 text-darkmuted">{txn.category}</td>
                    <td className="py-3 px-4 text-darkmuted">
                      {new Date(txn.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-darkcard rounded-xl p-6 max-w-md w-full border border-darkborder max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-darktext mb-4">Add Group Expense</h2>
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-darktext mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-darksecondary border border-darkborder rounded-xl text-darktext focus:outline-none focus:border-accent-mid"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-darktext mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="w-full px-4 py-2 bg-darksecondary border border-darkborder rounded-xl text-darktext focus:outline-none focus:border-accent-mid"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-darktext mb-2">Paid By</label>
                <select
                  value={formData.paid_by}
                  onChange={(e) => setFormData({ ...formData, paid_by: e.target.value })}
                  className="w-full px-4 py-2 bg-darksecondary border border-darkborder rounded-xl text-darktext focus:outline-none focus:border-accent-mid"
                  required
                >
                  <option value="">Select member</option>
                  {(group.members || []).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-darktext mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-darksecondary border border-darkborder rounded-xl text-darktext focus:outline-none focus:border-accent-mid"
                >
                  {['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Others'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-darktext mb-2">Split Type</label>
                <select
                  value={formData.split_type}
                  onChange={(e) => setFormData({ ...formData, split_type: e.target.value })}
                  className="w-full px-4 py-2 bg-darksecondary border border-darkborder rounded-xl text-darktext focus:outline-none focus:border-accent-mid"
                >
                  <option value="equal">Equal Split</option>
                  <option value="percentage">Percentage Split</option>
                  <option value="custom">Custom Split</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-darksecondary border border-darkborder rounded-xl text-darktext hover:bg-darkbg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-accent-start to-accent-end rounded-xl text-white font-medium hover:shadow-glow transition-all"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
