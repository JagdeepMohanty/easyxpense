import React, { useState, useEffect } from 'react';
import { friendsAPI } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';

const FriendsNew = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFriend, setEditingFriend] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await friendsAPI.getAll('', 1, 100);
      setFriends(response.data.friends || []);
    } catch (err) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Friend name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingFriend) {
        await friendsAPI.update(editingFriend._id, formData);
      } else {
        await friendsAPI.add(formData);
      }
      setShowAddModal(false);
      setEditingFriend(null);
      setFormData({ name: '' });
      fetchFriends();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (friend) => {
    setEditingFriend(friend);
    setFormData({ name: friend.name });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this friend?')) return;
    
    try {
      await friendsAPI.delete(id);
      fetchFriends();
    } catch (err) {
      alert('Failed to delete friend');
    }
  };

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary dark:text-textPrimary-dark">Friends</h1>
            <p className="text-textSecondary dark:text-textSecondary-dark mt-1">Manage your friends list</p>
          </div>
          <button
            onClick={() => {
              setEditingFriend(null);
              setFormData({ name: '' });
              setShowAddModal(true);
            }}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
          >
            + Add Friend
          </button>
        </div>

        {friends.length > 0 && (
          <Input
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}

        {friends.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No friends yet"
            description="Add your first friend to start splitting expenses"
            action={() => setShowAddModal(true)}
            actionLabel="Add First Friend"
          />
        ) : filteredFriends.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No results found"
            description={`No friends match "${searchTerm}"`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map(friend => (
              <div key={friend._id} className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {friend.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-textPrimary dark:text-textPrimary-dark">{friend.name}</h3>
                      <p className="text-sm text-textSecondary dark:text-textSecondary-dark">Friend</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(friend)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(friend._id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card dark:bg-card-dark rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark mb-6">
                {editingFriend ? 'Edit Friend' : 'Add Friend'}
              </h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Friend Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingFriend(null);
                      setFormData({ name: '' });
                      setError('');
                    }}
                    className="flex-1 h-11 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-textPrimary dark:text-textPrimary-dark font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-11 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                  >
                    {submitting ? 'Saving...' : editingFriend ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FriendsNew;
