import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { groupsAPI, groupTransactionsAPI, analyticsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#7B5CFF', '#C4B5FD', '#FDBA74'];

const GroupDetails = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({});
  const [chartData, setChartData] = useState({ member_spending: [], category_split: [] });
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    total_amount: '',
    paid_by: '',
    split_type: 'equal',
    category: 'Others'
  });

  useEffect(() => {
    fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
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
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      const members = group.members || [];
      const splits = members.map(m => ({ user_id: m }));

      await groupTransactionsAPI.create(groupId, {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        splits
      });

      setShowModal(false);
      setFormData({ description: '', total_amount: '', paid_by: '', split_type: 'equal', category: 'Others' });
      fetchGroupData();
    } catch (err) {
      // Handle error
    }
  };

  if (loading) return <div className="text-primarywhite">Loading...</div>;
  if (!group) return <div className="text-primarywhite">Group not found</div>;

  const debtsList = Object.entries(balances)
    .filter(([_, balance]) => balance !== 0)
    .map(([member, balance]) => ({
      member,
      amount: Math.abs(balance),
      type: balance > 0 ? 'owed' : 'owes'
    }));

  return (
    <div className="space-y-gap">
      <div className="flex justify-between items-start">
        <div>
          <Link to="/groups" className="text-cyberpurple hover:text-lavender text-sm mb-2 inline-block transition-colors">
            ← Back to Groups
          </Link>
          <h1 className="text-4xl font-bold text-primarywhite">{group.name}</h1>
          <p className="text-muted mt-2">Code: {group.group_code}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-cyber-gradient text-primarywhite rounded-2xl font-semibold hover:shadow-glow hover:scale-105 transition-all duration-200"
        >
          + Add Expense
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-gap">
        <div className="bg-offblack rounded-2xl p-6 shadow-cyber border border-white/5">
          <div className="text-muted text-sm mb-2">Total Expenses</div>
          <div className="text-3xl font-bold text-primarywhite">{formatCurrency(summary.total_expense || 0)}</div>
        </div>
        <div className="bg-offblack rounded-2xl p-6 shadow-cyber border border-white/5">
          <div className="text-muted text-sm mb-2">Transactions</div>
          <div className="text-3xl font-bold text-primarywhite">{summary.total_transactions || 0}</div>
        </div>
        <div className="bg-offblack rounded-2xl p-6 shadow-cyber border border-white/5">
          <div className="text-muted text-sm mb-2">Members</div>
          <div className="text-3xl font-bold text-primarywhite">{group.members?.length || 0}</div>
        </div>
      </div>

      {debtsList.length > 0 && (
        <div className="bg-offblack rounded-2xl p-6 shadow-cyber border border-white/5">
          <h2 className="text-xl font-bold text-primarywhite mb-6">Member Balances</h2>
          <div className="space-y-3">
            {debtsList.map((debt, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-pureblack rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    debt.type === 'owed' ? 'bg-cyber-gradient' : 'bg-peachgold/20'
                  }`}>
                    <span className="text-primarywhite text-xl">{debt.type === 'owed' ? '↓' : '↑'}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-primarywhite">{debt.member}</p>
                    <p className="text-sm text-muted">{debt.type === 'owed' ? 'Gets back' : 'Owes'}</p>
                  </div>
                </div>
                <div className="text-xl font-bold text-primarywhite">{formatCurrency(debt.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-gap">
        <div className="bg-offblack rounded-2xl p-6 shadow-cyber border border-white/5">
          <h2 className="text-xl font-bold text-primarywhite mb-6">Member Spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.member_spending || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#A1A1A1" />
              <YAxis stroke="#A1A1A1" />
              <Tooltip contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#FFFFFF' }} />
              <Bar dataKey="amount" fill="#7B5CFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-offblack rounded-2xl p-6 shadow-cyber border border-white/5">
          <h2 className="text-xl font-bold text-primarywhite mb-6">Category Split</h2>
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
              <Tooltip contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#FFFFFF' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-offblack rounded-2xl p-6 shadow-cyber border border-white/5">
        <h2 className="text-xl font-bold text-primarywhite mb-6">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-muted text-center py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-muted font-semibold">Description</th>
                  <th className="text-left py-3 px-4 text-muted font-semibold">Paid By</th>
                  <th className="text-left py-3 px-4 text-muted font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-muted font-semibold">Category</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn._id} className="border-b border-white/5 hover:bg-pureblack transition-colors">
                    <td className="py-3 px-4 text-primarywhite">{txn.description}</td>
                    <td className="py-3 px-4 text-primarywhite">{txn.paid_by}</td>
                    <td className="py-3 px-4 text-primarywhite font-bold">{formatCurrency(txn.total_amount)}</td>
                    <td className="py-3 px-4 text-muted">{txn.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-offblack rounded-2xl p-6 max-w-md w-full shadow-cyber border border-white/5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-primarywhite mb-6">Add Group Expense</h2>
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primarywhite mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-pureblack border border-white/10 rounded-xl text-primarywhite focus:outline-none focus:border-cyberpurple transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primarywhite mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="w-full px-4 py-3 bg-pureblack border border-white/10 rounded-xl text-primarywhite focus:outline-none focus:border-cyberpurple transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primarywhite mb-2">Paid By</label>
                <select
                  value={formData.paid_by}
                  onChange={(e) => setFormData({ ...formData, paid_by: e.target.value })}
                  className="w-full px-4 py-3 bg-pureblack border border-white/10 rounded-xl text-primarywhite focus:outline-none focus:border-cyberpurple transition-all"
                  required
                >
                  <option value="">Select member</option>
                  {(group.members || []).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-primarywhite mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-pureblack border border-white/10 rounded-xl text-primarywhite focus:outline-none focus:border-cyberpurple transition-all"
                >
                  {['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Others'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-pureblack border border-white/10 rounded-xl text-muted hover:text-primarywhite hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-cyber-gradient text-primarywhite rounded-xl font-semibold hover:shadow-glow hover:scale-105 transition-all duration-200"
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
