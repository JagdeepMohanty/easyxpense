import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expensesAPI, friendsAPI } from '../services/api';
import { parseAmount, calculateSplitAmount, formatCurrency } from '../utils/currency';
import Header from '../components/Header';

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
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await friendsAPI.getAll();
      setFriends(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      setFriends([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleParticipantChange = (friendName, isChecked) => {
    setFormData(prev => ({
      ...prev,
      participants: isChecked
        ? [...prev.participants, friendName]
        : prev.participants.filter(name => name !== friendName)
    }));
    
    if (validationErrors.participants) {
      setValidationErrors(prev => ({
        ...prev,
        participants: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    const amount = parseAmount(formData.amount);
    if (!amount || amount <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!formData.payer) {
      errors.payer = 'Please select who paid';
    }
    
    if (formData.participants.length === 0) {
      errors.participants = 'Please select at least one participant';
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
      await expensesAPI.create({
        description: formData.description.trim(),
        amount: parseAmount(formData.amount),
        payer: formData.payer,
        participants: formData.participants
      });

      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.success === false) {
        setError(err.response.data.error);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to add expense');
      }
    } finally {
      setLoading(false);
    }
  };

  const splitAmount = formData.participants.length > 0 
    ? calculateSplitAmount(parseAmount(formData.amount), formData.participants.length)
    : 0;

  return (
    <div>
      <Header title="Add Expense" />

      <div className="max-w-2xl mx-auto">
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-lg">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark mb-2">
                What was this expense for?
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Dinner at Italian restaurant"
                className="w-full px-4 py-3 bg-background dark:bg-background-dark border border-primary/20 rounded-lg text-textPrimary dark:text-textPrimary-dark placeholder-textSecondary dark:placeholder-textSecondary-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
              )}
            </div>

            {/* Amount and Payer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-3 bg-background dark:bg-background-dark border border-primary/20 rounded-lg text-textPrimary dark:text-textPrimary-dark placeholder-textSecondary dark:placeholder-textSecondary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {validationErrors.amount && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.amount}</p>
                )}
                {splitAmount > 0 && (
                  <p className="mt-1 text-sm text-primary">Split: {formatCurrency(splitAmount)} per person</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark mb-2">
                  Who paid?
                </label>
                <select
                  name="payer"
                  value={formData.payer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background dark:bg-background-dark border border-primary/20 rounded-lg text-textPrimary dark:text-textPrimary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select payer</option>
                  {friends.map(friend => (
                    <option key={friend._id} value={friend.name}>
                      {friend.name}
                    </option>
                  ))}
                </select>
                {validationErrors.payer && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.payer}</p>
                )}
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark mb-2">
                Who participated in this expense?
              </label>
              {friends.length === 0 ? (
                <div className="text-center py-8 bg-background dark:bg-background-dark rounded-lg">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-textPrimary dark:text-textPrimary-dark font-medium mb-1">Add friends first</p>
                  <p className="text-textSecondary dark:text-textSecondary-dark text-sm mb-4">
                    You'll need at least one friend before creating an expense.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/friends')}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Go to Friends
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-background dark:bg-background-dark rounded-lg max-h-64 overflow-y-auto">
                    {friends.map(friend => (
                      <label 
                        key={friend._id} 
                        className="flex items-center gap-3 p-3 bg-card dark:bg-card-dark rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.participants.includes(friend.name)}
                          onChange={(e) => handleParticipantChange(friend.name, e.target.checked)}
                          className="w-4 h-4 text-primary border-primary/20 rounded focus:ring-primary"
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary text-sm font-semibold">
                              {friend.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-textPrimary dark:text-textPrimary-dark">{friend.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {validationErrors.participants && (
                    <p className="mt-2 text-sm text-red-500">{validationErrors.participants}</p>
                  )}
                  {formData.participants.length > 0 && (
                    <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                      <div className="text-sm text-primary">
                        <strong>{formData.participants.length} people selected</strong>
                        {splitAmount > 0 && (
                          <span className="ml-2">• {formatCurrency(splitAmount)} each</span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-4 py-3 bg-background dark:bg-background-dark border border-primary/20 text-textSecondary dark:text-textSecondary-dark rounded-lg font-semibold hover:border-primary/40 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || friends.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md"
              >
                {loading ? 'Adding Expense...' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
