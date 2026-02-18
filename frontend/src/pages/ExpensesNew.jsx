import React, { useState, useEffect } from 'react';
import { expensesAPI, friendsAPI } from '../services/api';
import Header from '../components/Header';
import InputBox from '../components/InputBox';

const Expenses = () => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    selectedFriends: []
  });
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await friendsAPI.getAll();
      setFriends(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch friends');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFriendSelect = (friendId) => {
    setFormData(prev => ({
      ...prev,
      selectedFriends: prev.selectedFriends.includes(friendId)
        ? prev.selectedFriends.filter(id => id !== friendId)
        : [...prev.selectedFriends, friendId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await expensesAPI.create({
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date,
        friends: formData.selectedFriends
      });
      
      setSuccess('Expense added successfully!');
      setFormData({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        selectedFriends: []
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Add Expense" />
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-lg">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputBox
                label="Amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
              
              <InputBox
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Food, Transport, etc."
                required
              />
            </div>

            <InputBox
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What was this expense for?"
              required
            />

            <InputBox
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark">
                Split with Friends
              </label>
              <div className="bg-background dark:bg-background-dark border border-primary/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                {friends.length === 0 ? (
                  <p className="text-textSecondary dark:text-textSecondary-dark text-sm">No friends available</p>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => (
                      <label key={friend._id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedFriends.includes(friend._id)}
                          onChange={() => handleFriendSelect(friend._id)}
                          className="w-4 h-4 text-primary bg-background dark:bg-background-dark border-primary/20 rounded focus:ring-primary focus:ring-2"
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {friend.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-textPrimary dark:text-textPrimary-dark">{friend.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md"
            >
              {loading ? 'Adding Expense...' : 'Add Expense'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Expenses;