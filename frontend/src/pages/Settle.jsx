import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendsAPI, settlementsAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { parseAmount } from '../utils/currency';
import './Settle.css';

const Settle = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!toUserId) {
      setError('Please select a friend');
      return;
    }
    
    const parsedAmount = parseAmount(amount);
    if (!parsedAmount) {
      setError('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    try {
      await settlementsAPI.createSettlement({ toUserId, amount: parsedAmount });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to settle debt');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="settle-form">
      <h2>Settle Debt</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <select 
          value={toUserId} 
          onChange={(e) => setToUserId(e.target.value)}
          required
        >
          <option value="">Select Friend</option>
          {friends.map((friend) => (
            <option key={friend._id} value={friend._id}>
              {friend.name}
            </option>
          ))}
        </select>
        <div className="amount-input">
          <span className="currency-symbol">₹</span>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Settling...' : 'Settle Debt'}
        </button>
      </form>
    </div>
  );
};

export default Settle;