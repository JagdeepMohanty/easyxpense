import React, { useState, useEffect, useCallback } from 'react';
import { friendsAPI } from '../../services/api';
import Header from '../../components/Header';
import InputBox from '../../components/InputBox';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      const response = await friendsAPI.getAll();
      setFriends(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      await friendsAPI.add({
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });
      setFormData({ name: '', phone: '' });
      setSuccess('Friend added successfully!');
      await fetchFriends();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add friend');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (friendId) => {
    if (!confirm('Are you sure you want to delete this friend?')) return;
    
    try {
      await friendsAPI.delete(friendId);
      setSuccess('Friend deleted successfully!');
      await fetchFriends();
    } catch (err) {
      setError('Failed to delete friend');
    }
  };

  return (
    <div>
      <Header title="Friends" />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-textPrimary dark:text-textPrimary-dark mb-6">Add New Friend</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox
                label="Friend's Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
                required
              />
              
              <InputBox
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., 9876543210"
                helper="10-digit Indian mobile number"
                required
              />
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md"
              >
                {loading ? 'Adding Friend...' : 'Add Friend'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-textPrimary dark:text-textPrimary-dark">Your Friends</h2>
              <div className="text-sm text-textSecondary dark:text-textSecondary-dark">
                {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
              </div>
            </div>

            {loading && friends.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-textSecondary dark:text-textSecondary-dark">Loading friends...</span>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <div className="text-xl font-semibold text-textPrimary dark:text-textPrimary-dark mb-2">No friends yet</div>
                <div className="text-textSecondary dark:text-textSecondary-dark max-w-md mx-auto">
                  Add friends to start splitting expenses and tracking who owes what.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map(friend => (
                  <div key={friend._id} className="p-4 bg-background dark:bg-background-dark rounded-lg hover:bg-primary/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-lg">
                            {friend.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-textPrimary dark:text-textPrimary-dark truncate">{friend.name}</h3>
                          <p className="text-sm text-textSecondary dark:text-textSecondary-dark truncate">{friend.phone || friend.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(friend._id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
