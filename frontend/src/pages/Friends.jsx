import React, { useState, useEffect } from 'react';
import { friendsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // FIX: Fetch friends on mount and when navigating back to this page
  useEffect(() => {
    fetchFriends();
  }, []); // Empty deps is correct - fetchFriends is stable

  const fetchFriends = async () => {
    try {
      const response = await friendsAPI.getAll();
      // FIX: Ensure we always set an array, even if API returns unexpected format
      setFriends(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch friends:', err);
      // FIX: Set empty array on error so UI doesn't break
      setFriends([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFriend(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newFriend.name.trim()) {
      errors.name = 'Name is required';
    } else if (newFriend.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!newFriend.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newFriend.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await friendsAPI.add({
        name: newFriend.name.trim(),
        email: newFriend.email.trim()
      });

      setNewFriend({ name: '', email: '' });
      // FIX: Refresh friends list after adding new friend
      await fetchFriends();
    } catch (err) {
      console.error('Add friend error:', err);
      if (err.response?.data?.success === false) {
        setError(err.response.data.error);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to add friend');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="friends">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Friends</h1>
        <p className="text-gray-600">Manage your friends to split expenses with</p>
      </div>

      {/* Add Friend Form */}
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
                floating
              />
              
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={newFriend.email}
                onChange={handleInputChange}
                placeholder="e.g., john@example.com"
                error={validationErrors.email}
                helper="We'll use this to identify your friend"
                floating
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={loading}
                icon="👥"
              >
                {loading ? 'Adding Friend...' : 'Add Friend'}
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>

      {/* Friends List */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Friends</h2>
            <div className="text-sm text-gray-500">
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {friends.length === 0 ? (
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
                <div key={friend._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">
                        {friend.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{friend.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{friend.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Tips Card */}
      {friends.length > 0 && (
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
    </div>
  );
};

export default Friends;