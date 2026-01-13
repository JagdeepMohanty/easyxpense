import React, { useState, useEffect } from 'react';
import { expensesAPI, settlementsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

const PaymentHistory = () => {
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [expensesRes, settlementsRes] = await Promise.all([
        expensesAPI.getAll(),
        settlementsAPI.getHistory()
      ]);
      
      setExpenses(expensesRes.data);
      setSettlements(settlementsRes.data);
    } catch (err) {
      setError('Failed to load history');
      console.error('History error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="payment-history">
        <div className="loading">Loading history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="payment-history">
      <div className="page-header">
        <h1>Payment History</h1>
      </div>

      <div className="history-tabs">
        <button
          className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses ({expenses.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'settlements' ? 'active' : ''}`}
          onClick={() => setActiveTab('settlements')}
        >
          Settlements ({settlements.length})
        </button>
      </div>

      <div className="history-content">
        {activeTab === 'expenses' ? (
          <div className="expenses-history">
            {expenses.length === 0 ? (
              <div className="empty-state">
                <p>No expenses recorded yet.</p>
              </div>
            ) : (
              <div className="history-list">
                {expenses.map(expense => (
                  <div key={expense._id} className="history-item expense-item">
                    <div className="item-icon">💰</div>
                    <div className="item-details">
                      <h3>{expense.description}</h3>
                      <p>Paid by: {expense.payer}</p>
                      <p>Participants: {expense.participants?.length || 0} people</p>
                      <small>{formatDate(expense.date)}</small>
                    </div>
                    <div className="item-amount">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="settlements-history">
            {settlements.length === 0 ? (
              <div className="empty-state">
                <p>No settlements recorded yet.</p>
              </div>
            ) : (
              <div className="history-list">
                {settlements.map(settlement => (
                  <div key={settlement._id} className="history-item settlement-item">
                    <div className="item-icon">💳</div>
                    <div className="item-details">
                      <h3>Settlement</h3>
                      <p>From: {settlement.fromUser?.name || 'Unknown'}</p>
                      <p>To: {settlement.toUser?.name || 'Unknown'}</p>
                      <small>{formatDate(settlement.date)}</small>
                    </div>
                    <div className="item-amount settlement-amount">
                      {formatCurrency(settlement.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;