import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expensesAPI, friendsAPI } from '../services/api';
import { parseAmount, calculateSplitAmount, formatCurrency } from '../utils/currency';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
    setFormData(prev => ({
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

  const handleParticipantChange = (friendName, isChecked) => {
    setFormData(prev => ({
      ...prev,
      participants: isChecked
        ? [...prev.participants, friendName]
        : prev.participants.filter(name => name !== friendName)
    }));
    
    // Clear participants validation error
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
      console.error('Add expense error:', err);
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
    <div className="add-expense">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Expense</h1>
        <p className="text-gray-600">Split a bill or expense with your friends</p>
      </div>

      <div className="max-w-2xl">
        <Card>
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
              {/* Description */}
              <Input
                label="What was this expense for?"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Dinner at Italian restaurant"
                error={validationErrors.description}
                floating
              />

              {/* Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Amount (₹)"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  error={validationErrors.amount}
                  helper={splitAmount > 0 ? `Split: ${formatCurrency(splitAmount)} per person` : ''}
                  floating
                />

                {/* Payer */}
                <div className="form-group">
                  <label className="form-label">Who paid?</label>
                  <select
                    className={`form-select ${validationErrors.payer ? 'form-error' : ''}`}
                    name="payer"
                    value={formData.payer}
                    onChange={handleInputChange}
                  >
                    <option value="">Select payer</option>
                    {friends.map(friend => (
                      <option key={friend._id} value={friend.name}>
                        {friend.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.payer && (
                    <div className="form-error-message">⚠️ {validationErrors.payer}</div>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div className="form-group">
                <label className="form-label">Who participated in this expense?</label>
                {friends.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">Add friends first</div>
                    <div className="empty-state-description">
                      You'll need at least one friend before creating an expense.
                    </div>
                    <Button 
                      as="a" 
                      href="/friends" 
                      variant="primary"
                      className="mt-4"
                    >
                      Go to Friends
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                      {friends.map(friend => (
                        <label 
                          key={friend._id} 
                          className="flex items-center gap-3 p-3 bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.participants.includes(friend.name)}
                            onChange={(e) => handleParticipantChange(friend.name, e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 text-sm font-semibold">
                                {friend.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{friend.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {validationErrors.participants && (
                      <div className="form-error-message mt-2">⚠️ {validationErrors.participants}</div>
                    )}
                    {formData.participants.length > 0 && (
                      <div className="mt-3 p-3 bg-primary-50 rounded-md">
                        <div className="text-sm text-primary-700">
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
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={friends.length === 0}
                  className="flex-1"
                >
                  {loading ? 'Adding Expense...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AddExpense;