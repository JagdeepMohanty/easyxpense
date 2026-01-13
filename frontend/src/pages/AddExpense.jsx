import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expensesAPI, friendsAPI } from '../services/api';
import { parseAmount, calculateSplitAmount, formatCurrency } from '../utils/currency';

const AddExpense = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    payer: '',
    participants: []
  });
  const [friends, setFriends] = useState([]);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParticipantChange = (friendId, isChecked) => {
    setFormData(prev => ({
      ...prev,
      participants: isChecked
        ? [...prev.participants, friendId]
        : prev.participants.filter(id => id !== friendId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    const amount = parseAmount(formData.amount);
    if (!amount) {
      setError('Please enter a valid amount');
      return;
    }

    if (!formData.payer) {
      setError('Please select who paid');
      return;
    }

    if (formData.participants.length === 0) {
      setError('Please select at least one participant');
      return;
    }

    try {
      setLoading(true);
      await expensesAPI.create({
        description: formData.description.trim(),
        amount: amount,
        payer: formData.payer,
        participants: formData.participants
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const splitAmount = formData.participants.length > 0 
    ? calculateSplitAmount(parseAmount(formData.amount), formData.participants.length)
    : 0;

  return (
    <div className="add-expense">
      <div className="page-header">
        <h1>Add New Expense</h1>
      </div>

      <form onSubmit={handleSubmit} className="expense-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., Dinner at restaurant"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
          />
          {splitAmount > 0 && (
            <small className="split-info">
              Split amount: {formatCurrency(splitAmount)} per person
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="payer">Who paid?</label>
          <select
            id="payer"
            name="payer"
            value={formData.payer}
            onChange={handleInputChange}
            required
          >
            <option value="">Select payer</option>
            {friends.map(friend => (
              <option key={friend._id} value={friend._id}>
                {friend.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Participants</label>
          {friends.length === 0 ? (
            <p className="no-friends">
              No friends added yet. <a href="/friends">Add friends first</a>
            </p>
          ) : (
            <div className="participants-list">
              {friends.map(friend => (
                <label key={friend._id} className="participant-item">
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(friend._id)}
                    onChange={(e) => handleParticipantChange(friend._id, e.target.checked)}
                  />
                  <span>{friend.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;