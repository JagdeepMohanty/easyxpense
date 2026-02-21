import React, { useState, useEffect, useCallback } from 'react';
import { friendsAPI } from '../../services/api';
import Header from '../../components/Header';
import InputBox from '../../components/InputBox';

const FriendsNew = () => {
  const [friends, setFriends] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingFriend, setEditingFriend] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      const response = await friendsAPI.getAll();
      setFriends(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch friends. Please try again.');
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

    if (!formData.name.trim()) {
      setError('Please enter a name');
      return;
    }

    try {
      setLoading(true);
      if (editingFriend) {
        await friendsAPI.update(editingFriend._id, {
          name: formData.name.trim(),
          phone: formData.phone.trim()
        });
        setSuccess('Friend updated successfully!');
      } else {
        await friendsAPI.add({
          name: formData.name.trim(),
          phone: formData.phone.trim()
        });
        setSuccess('Friend added successfully!');
      }
      setFormData({ name: '', phone: '' });
      setEditingFriend(null);
      await fetchFriends();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save friend');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (friend) => {
    setEditingFriend(friend);
    setFormData({ name: friend.name, phone: friend.phone || '' });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingFriend(null);
    setFormData({ name: '', phone: '' });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (friendId) => {
    try {
      await friendsAPI.delete(friendId);
      setShowDeleteConfirm(null);
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
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md sticky top-24">
            <h2 className="text-xl font-semibold text-textPrimary dark:text-textPrimary-dark mb-6">
              {editingFriend ? 'Edit Friend' : 'Add New Friend'}
            </h2>
            
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
              />
              
              <div className="flex gap-3">
                {editingFriend && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-3 bg-background dark:bg-background-dark border border-primary/20 text-textSecondary dark:text-textSecondary-dark rounded-lg font-semibold transition-all hover:border-primary/40"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md"
                >
                  {loading ? 'Saving...' : editingFriend ? 'Update Friend' : 'Add Friend'}
                </button>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(friend)}
                          className="p-2 text-textSecondary dark:text-textSecondary-dark hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit friend"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(friend)}
                          className="p-2 text-textSecondary dark:text-textSecondary-dark hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete friend"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark mb-4">Delete Friend</h2>
            <p className="text-textSecondary dark:text-textSecondary-dark mb-6">
              Are you sure you want to delete "{showDeleteConfirm.name}"? This will also remove them from any groups and settlements.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-background dark:bg-background-dark border border-primary/20 rounded-lg text-textSecondary dark:text-textSecondary-dark hover:text-textPrimary dark:hover:text-textPrimary-dark transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm._id)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsNew;
