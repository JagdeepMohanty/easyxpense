import React, { useState, useEffect } from 'react';
import { debtsAPI, settlementsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

const DebtTracker = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settlingDebt, setSettlingDebt] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState('');

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const response = await debtsAPI.getAll();
      setDebts(response.data);
    } catch (err) {
      setError('Failed to load debts');
      console.error('Debts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleDebt = async (debt) => {
    if (!settlementAmount || parseFloat(settlementAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await settlementsAPI.create({
        fromUserId: debt.amount < 0 ? 'current_user' : debt.friendId,
        toUserId: debt.amount < 0 ? debt.friendId : 'current_user',
        amount: parseFloat(settlementAmount)
      });

      setSettlingDebt(null);
      setSettlementAmount('');
      fetchDebts();
    } catch (err) {
      alert('Failed to settle debt');
      console.error('Settlement error:', err);
    }
  };

  if (loading) {
    return (
      <div className="debt-tracker">
        <div className="loading">Loading debts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="debt-tracker">
        <div className="error">{error}</div>
      </div>
    );
  }

  const activeDebts = debts.filter(debt => Math.abs(debt.amount) > 0.01);
  const totalOwed = debts
    .filter(debt => debt.amount > 0)
    .reduce((sum, debt) => sum + debt.amount, 0);
  const totalOwe = debts
    .filter(debt => debt.amount < 0)
    .reduce((sum, debt) => sum + Math.abs(debt.amount), 0);

  return (
    <div className="debt-tracker">
      <div className="page-header">
        <h1>Debt Tracker</h1>
      </div>

      <div className="debt-summary">
        <div className="summary-cards">
          <div className="summary-card positive">
            <h3>Total Owed to You</h3>
            <p className="amount">{formatCurrency(totalOwed)}</p>
          </div>
          <div className="summary-card negative">
            <h3>Total You Owe</h3>
            <p className="amount">{formatCurrency(totalOwe)}</p>
          </div>
          <div className="summary-card neutral">
            <h3>Net Balance</h3>
            <p className={`amount ${totalOwed - totalOwe >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totalOwed - totalOwe)}
            </p>
          </div>
        </div>
      </div>

      <div className="debts-section">
        <h2>Active Debts</h2>
        {activeDebts.length === 0 ? (
          <div className="empty-state">
            <p>🎉 All settled up! No outstanding debts.</p>
          </div>
        ) : (
          <div className="debts-list">
            {activeDebts.map(debt => (
              <div key={debt.friendId} className={`debt-card ${debt.amount > 0 ? 'owed-to-you' : 'you-owe'}`}>
                <div className="debt-info">
                  <div className="friend-avatar">
                    {debt.friendName.charAt(0).toUpperCase()}
                  </div>
                  <div className="debt-details">
                    <h3>{debt.friendName}</h3>
                    <p className="debt-amount">
                      {debt.amount > 0 ? (
                        <>owes you <strong>{formatCurrency(debt.amount)}</strong></>
                      ) : (
                        <>you owe <strong>{formatCurrency(Math.abs(debt.amount))}</strong></>
                      )}
                    </p>
                  </div>
                </div>
                <div className="debt-actions">
                  {settlingDebt === debt.friendId ? (
                    <div className="settle-form">
                      <input
                        type="number"
                        value={settlementAmount}
                        onChange={(e) => setSettlementAmount(e.target.value)}
                        placeholder="Amount"
                        min="0.01"
                        step="0.01"
                        className="settle-input"
                      />
                      <button
                        onClick={() => handleSettleDebt(debt)}
                        className="btn btn-primary btn-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setSettlingDebt(null);
                          setSettlementAmount('');
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSettlingDebt(debt.friendId);
                        setSettlementAmount(Math.abs(debt.amount).toString());
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Settle Up
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtTracker;