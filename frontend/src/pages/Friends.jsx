import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendsAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import './Friends.css';

const Friends = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        const response = await friendsAPI.getFriends();
        setFriends(response.data);
      } catch (err) {
        console.error('Failed to fetch friends:', err);
      }
    };

    fetchFriends();
  }, [user, navigate]);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!friendEmail.trim()) {
      setError('Please enter a valid email');
      return;
    }
    
    setLoading(true);
    try {
      await friendsAPI.addFriend(friendEmail.trim());
      setFriendEmail('');
      const response = await friendsAPI.getFriends();
      setFriends(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add friend');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="friends-container">
      <h2>Your Friends</h2>
      {error && <div className="error-message">{error}</div>}
      <form className="add-friend" onSubmit={handleAddFriend}>
        <input
          type="email"
          placeholder="Friend's Email"
          value={friendEmail}
          onChange={(e) => setFriendEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Friend'}
        </button>
      </form>
      <div className="friends-list">
        {friends.length === 0 ? (
          <p>No friends added yet.</p>
        ) : (
          friends.map((friend) => (
            <div key={friend._id} className="friend-card">
              <span>{friend.name}</span>
              <span className="email">{friend.email}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Friends;