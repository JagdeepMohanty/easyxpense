import React, { useState, useEffect } from 'react';
import { friendsAPI } from '../services/api';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await friendsAPI.getAll();
      setFriends(response.data);
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFriend(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newFriend.name.trim() || !newFriend.email.trim()) {
      setError('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      await friendsAPI.add({
        name: newFriend.name.trim(),
        email: newFriend.email.trim()
      });

      setNewFriend({ name: '', email: '' });
      fetchFriends();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add friend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="friends">
      <div className="page-header">
        <h1>Friends</h1>
      </div>

      <div className="add-friend-section">
        <h2>Add New Friend</h2>
        <form onSubmit={handleSubmit} className="friend-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={newFriend.name}
                onChange={handleInputChange}
                placeholder="Friend's name"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={newFriend.email}
                onChange={handleInputChange}
                placeholder="Friend's email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Adding...' : 'Add Friend'}
            </button>
          </div>
        </form>
      </div>

      <div className="friends-list-section">
        <h2>Your Friends ({friends.length})</h2>
        {friends.length === 0 ? (
          <div className="empty-state">
            <p>No friends added yet. Add your first friend above!</p>
          </div>
        ) : (
          <div className="friends-grid">
            {friends.map(friend => (
              <div key={friend._id} className="friend-card">
                <div className="friend-avatar">
                  {friend.name.charAt(0).toUpperCase()}
                </div>
                <div className="friend-info">
                  <h3>{friend.name}</h3>
                  <p>{friend.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;