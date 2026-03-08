import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expensesAPI, friendsAPI } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Input from '../components/ui/Input';
import { ArrowLeft } from 'lucide-react';

const AddExpense = () => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    paidBy: 'You',
    splitType: 'equal',
  });
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [customSplits, setCustomSplits] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'];

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await friendsAPI.getAll('', 1, 100);
      setFriends(response.data.data || []);
    } catch (err) {
      // Silent fail
    }
  };

  const handleFriendToggle = (friendName) => {
    setSelectedFriends(prev => 
      prev.includes(friendName) 
        ? prev.filter(f => f !== friendName)
        : [...prev, friendName]
    );
  };

  const handleCustomSplitChange = (friendName, value) => {
    setCustomSplits(prev => ({ ...prev, [friendName]: parseFloat(value) || 0 }));
  };

  const calculateSplits = () => {
    const amount = parseFloat(formData.amount) || 0;
    const participants = [formData.paidBy, ...selectedFriends];
    
    if (formData.splitType === 'equal') {
      const perPerson = amount / participants.length;
      return participants.map(name => ({ name, amount: perPerson }));
    } else if (formData.splitType === 'percentage') {
      return participants.map(name => ({
        name,
        amount: (amount * (customSplits[name] || 0)) / 100
      }));
    } else {
      return participants.map(name => ({
        name,
        amount: customSplits[name] || 0
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description || !formData.amount) {
      setError('Description and amount are required');
      return;
    }

    if (selectedFriends.length === 0) {
      setError('Please select at least one friend to split with');
      return;
    }

    const splits = calculateSplits();
    const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
    const amount = parseFloat(formData.amount);

    if (formData.splitType !== 'equal' && Math.abs(totalSplit - amount) > 0.01) {
      setError(`Split amounts must equal total (${totalSplit.toFixed(2)} ≠ ${amount.toFixed(2)})`);
      return;
    }

    try {
      setLoading(true);
      await expensesAPI.create({
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        paidBy: formData.paidBy,
        splitType: formData.splitType,
        friends: selectedFriends,
        splits: splits,
      });
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/expenses')}
            className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Expenses
          </button>
          <h1 className="text-2xl font-semibold text-text-main">Add Expense</h1>
          <p className="text-sm text-text-muted mt-1">
            Split a new expense with friends
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-xl p-6 shadow-lg space-y-4">
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Dinner at restaurant"
              required
            />

            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="1000"
              required
            />

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-11 px-4 py-2 bg-main border border-slate-700 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <Input
              label="Paid By"
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
              placeholder="Your name"
              required
            />
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg">
            <label className="block text-sm font-medium text-text-main mb-3">
              Split Type
            </label>
            <div className="flex gap-2">
              {['equal', 'percentage', 'exact'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, splitType: type })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.splitType === type
                      ? 'bg-primary text-white'
                      : 'bg-main text-text-muted hover:bg-slate-800'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg">
            <label className="block text-sm font-medium text-text-main mb-3">
              Split With Friends
            </label>
            {friends.length === 0 ? (
              <p className="text-sm text-text-muted">
                No friends added yet. <button type="button" onClick={() => navigate('/friends')} className="text-primary hover:underline">Add friends</button>
              </p>
            ) : (
              <div className="space-y-2">
                {friends.map(friend => (
                  <div key={friend._id} className="flex items-center justify-between p-3 bg-main rounded-lg">
                    <label className="flex items-center space-x-3 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend.name)}
                        onChange={() => handleFriendToggle(friend.name)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                      />
                      <span className="text-text-main">{friend.name}</span>
                    </label>
                    {selectedFriends.includes(friend.name) && formData.splitType !== 'equal' && (
                      <input
                        type="number"
                        step="0.01"
                        placeholder={formData.splitType === 'percentage' ? '%' : '₹'}
                        value={customSplits[friend.name] || ''}
                        onChange={(e) => handleCustomSplitChange(friend.name, e.target.value)}
                        className="w-24 h-9 px-3 bg-main border border-slate-700 rounded-lg text-text-main text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedFriends.length > 0 && (
            <div className="bg-card rounded-xl p-6 shadow-lg">
              <h3 className="text-sm font-medium text-text-main mb-3">Split Preview</h3>
              <div className="space-y-2">
                {calculateSplits().map((split, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-text-muted">{split.name}</span>
                    <span className="font-medium text-text-main">₹{split.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/expenses')}
              className="flex-1 h-11 bg-card border border-slate-700 text-text-main font-medium rounded-lg transition-all duration-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-primary hover:bg-accent disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-200"
            >
              {loading ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default AddExpense;
