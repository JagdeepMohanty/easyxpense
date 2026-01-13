import React, { useState, useEffect, useContext } from 'react';
import { debtsAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/currency';
import './DebtTracker.css';

const DebtTracker = () => {
  const { user } = useContext(AuthContext);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDebts = async () => {
      try {
        setLoading(true);
        const response = await debtsAPI.getDebts();
        setDebts(response.data);
      } catch (err) {
        setError('Failed to load debt information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDebts();
  }, []);

  if (loading) {
    return (
      <div className="debt-tracker">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading debt information...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="debt-tracker">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const activeDebts = debts.filter(debt => Math.abs(debt.amount) > 0.01);

  return (
    <div className="debt-tracker">
      <h2>Debt Tracker</h2>
      
      {activeDebts.length === 0 ? (
        <div className="no-debts">
          <p>🎉 All settled up! No outstanding debts.</p>
        </div>
      ) : (
        <div className="debt-summary">
          <div className="debt-stats">
            <div className="stat">
              <span className="stat-label">Total Friends:</span>
              <span className="stat-value">{debts.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Active Debts:</span>
              <span className="stat-value">{activeDebts.length}</span>
            </div>
          </div>
          
          <div className="debt-list">
            {activeDebts.map((debt) => (
              <div key={debt.friendId} className={`debt-card ${debt.amount > 0 ? 'owe-you' : 'you-owe'}`}>
                <div className="debt-info">
                  <span className="friend-name">{debt.friendName}</span>
                  <span className="debt-amount">
                    {debt.amount > 0 ? (
                      <span className="positive">
                        owes you {formatCurrency(debt.amount)}
                      </span>
                    ) : (
                      <span className="negative">
                        you owe {formatCurrency(Math.abs(debt.amount))}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtTracker;