import React, { useState, useEffect } from 'react';
import { friendsAPI } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import Input from '../../components/ui/Input';
import { Users, Pencil, Trash2, Plus } from 'lucide-react';

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

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await friendsAPI.getAll();
      setFriends(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  };

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
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary dark:text-textPrimary-dark">Friends</h1>
          <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-1">
            Manage your friends to split expenses
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-lg sticky top-24">
              <h2 className="text-lg font-medium text-textPrimary dark:text-textPrimary-dark mb-6">
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
                <Input
                  label="Friend's Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  required
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., 9876543210"
                />
                
                <div className="flex gap-3">
                  {editingFriend && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Saving...' : editingFriend ? 'Update Friend' : (
                      <>
                        <Plus size={20} />
                        Add Friend
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-textPrimary dark:text-textPrimary-dark">Your Friends</h2>
                <div className="text-sm text-textSecondary dark:text-textSecondary-dark">
                  {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
                </div>
              </div>

              {loading && friends.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto mb-4 text-textSecondary dark:text-textSecondary-dark" size={48} />
                  <h3 className="text-lg font-medium text-textPrimary dark:text-textPrimary-dark mb-2">No friends yet</h3>
                  <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                    Add friends to start splitting expenses
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {friends.map(friend => (
                    <div key={friend._id} className="p-4 bg-background dark:bg-background-dark rounded-lg hover:bg-emerald-500/5 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-lg">
                              {friend.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-textPrimary dark:text-textPrimary-dark truncate">{friend.name}</h3>
                            {friend.phone && (
                              <p className="text-sm text-textSecondary dark:text-textSecondary-dark truncate">{friend.phone}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(friend)}
                            className="p-2 text-textSecondary dark:text-textSecondary-dark hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                            title="Edit friend"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(friend)}
                            className="p-2 text-textSecondary dark:text-textSecondary-dark hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                            title="Delete friend"
                          >
                            <Trash2 size={18} />
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
              <h2 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark mb-4">Delete Friend</h2>
              <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-6">
                Are you sure you want to delete "{showDeleteConfirm.name}"?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm._id)}
                  className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FriendsNew;
