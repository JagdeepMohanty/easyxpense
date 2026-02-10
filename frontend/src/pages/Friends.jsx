import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { friendsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EditFriendModal from '../components/modals/EditFriendModal';
import ConfirmDialog from '../components/modals/ConfirmDialog';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [editingFriend, setEditingFriend] = useState(null);
  const [deletingFriend, setDeletingFriend] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFriends = useCallback(async () => {
    try {
      const response = await friendsAPI.getAll();
      setFriends(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setFriends([]);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewFriend(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [validationErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!newFriend.name.trim()) {
      errors.name = 'Name is required';
    } else if (newFriend.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!newFriend.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(newFriend.phone.trim())) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newFriend]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    try {
      setLoading(true);
      await friendsAPI.add({
        name: newFriend.name.trim(),
        phone: newFriend.phone.trim()
      });
      setNewFriend({ name: '', phone: '' });
      await fetchFriends();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add friend');
    } finally {
      setLoading(false);
    }
  }, [newFriend, validateForm, fetchFriends]);

  const handleEdit = useCallback((friend) => {
    setEditingFriend(friend);
  }, []);

  const handleDelete = useCallback((friend) => {
    setDeletingFriend(friend);
  }, []);

  const handleSaveEdit = useCallback(async (updatedData) => {
    try {
      setActionLoading(true);
      await friendsAPI.update(editingFriend._id, updatedData);
      setEditingFriend(null);
      await fetchFriends();
    } catch (err) {
      setError(err.message || 'Failed to update friend');
    } finally {
      setActionLoading(false);
    }
  }, [editingFriend, fetchFriends]);

  const handleConfirmDelete = useCallback(async () => {
    try {
      setActionLoading(true);
      await friendsAPI.delete(deletingFriend._id);
      setDeletingFriend(null);
      await fetchFriends();
    } catch (err) {
      setError(err.message || 'Failed to delete friend');
    } finally {
      setActionLoading(false);
    }
  }, [deletingFriend, fetchFriends]);

  const friendCount = useMemo(() => friends.length, [friends.length]);

  return (
    <div className="friends">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Friends</h1>
        <p className="text-gray-600">Manage your friends to split expenses with</p>
      </div>

      <Card className="mb-8">
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-900">Add New Friend</h2>
        </Card.Header>
        <Card.Body>
          {error && (
            <div className="alert alert-danger mb-6">
              <span>⚠️</span>
              <div>
                <strong>Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Friend's Name"
                name="name"
                value={newFriend.name}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
                error={validationErrors.name}
              />
              
              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                value={newFriend.phone}
                onChange={handleInputChange}
                placeholder="e.g., 9876543210"
                error={validationErrors.phone}
                helper="10-digit Indian mobile number"
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" loading={loading} icon="👥">
                {loading ? 'Adding Friend...' : 'Add Friend'}
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Friends</h2>
            <div className="text-sm text-gray-500">
              {friendCount} {friendCount === 1 ? 'friend' : 'friends'}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {friendCount === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">No friends yet</div>
              <div className="empty-state-description">
                Add friends above to start splitting expenses and tracking who owes what.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map(friend => (
                <div key={friend._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-lg">
                          {friend.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{friend.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{friend.phone || friend.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(friend)}>
                        ✏️
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(friend)}>
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {friendCount > 0 && (
        <Card className="mt-8">
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 text-2xl">💡</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pro Tips</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Friends you add here will be available when creating expenses</li>
                  <li>• You can select multiple friends to participate in each expense</li>
                  <li>• The app will automatically calculate how much each person owes</li>
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      <EditFriendModal
        isOpen={!!editingFriend}
        onClose={() => setEditingFriend(null)}
        onSave={handleSaveEdit}
        friend={editingFriend}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={!!deletingFriend}
        onClose={() => setDeletingFriend(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Friend"
        message={`Are you sure you want to delete ${deletingFriend?.name}? This action cannot be undone.`}
        confirmText="Delete"
        loading={actionLoading}
      />
    </div>
  );
};

export default React.memo(Friends);
