import React, { useState, useEffect } from 'react';
import { debtsAPI, settlementsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import Header from '../components/Header';

const DebtTracker = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settlingDebt, setSettlingDebt] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlingLoading, setSettlingLoading] = useState(false);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await debtsAPI.getAll();
      
      if (response.data.debts) {
        setDebts(Array.isArray(response.data.debts) ? response.data.debts : []);
      } else if (Array.isArray(response.data)) {
        setDebts(response.data);
      } else {
        setDebts([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load debts');
    } finally {
      setLoading(false);
    }
  };

  const handleSettleDebt = async (debt) => {
    const amount = parseFloat(settlementAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setSettlingLoading(true);
      await settlementsAPI.create({
        fromUser: debt.debtor,
        toUser: debt.creditor,
        amount: amount
      });

      setSettlingDebt(null);
      setSettlementAmount('');
      await fetchDebts();
    } catch (err) {
      alert(err.message || 'Failed to settle debt');
    } finally {
      setSettlingLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Debt Tracker" />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-textSecondary dark:text-textSecondary-dark">Loading debts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Debt Tracker" />
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  const activeDebts = debts.filter(debt => debt.amount > 0.01);
  const totalAmount = debts.reduce((sum, debt) => sum + (debt.amount || 0), 0);

  return (
    <div>
      <Header title="Debt Tracker" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-2">Pending Settlements</h3>
          <p className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">{activeDebts.length}</p>
          <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-1">
            {activeDebts.length > 0 ? 'Need attention' : 'All clear'}
          </p>
        </div>
        
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-2">Total Amount</h3>
          <p className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">{formatCurrency(totalAmount)}</p>
        </div>
        
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-2">Optimization</h3>
          <p className="text-2xl font-bold text-primary">60-90%</p>
          <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-1">Fewer transactions</p>
        </div>
      </div>

      {/* Active Debts */}
      <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-textPrimary dark:text-textPrimary-dark">Active Debts</h2>
          {activeDebts.length > 0 && (
            <div className="text-sm text-textSecondary dark:text-textSecondary-dark">
              Optimized to minimize transactions
            </div>
          )}
        </div>

        {activeDebts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-xl font-semibold text-textPrimary dark:text-textPrimary-dark mb-2">All settled up!</div>
            <div className="text-textSecondary dark:text-textSecondary-dark">
              No outstanding debts. Everyone's square!
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDebts.map((debt, index) => (
              <div key={index} className="p-4 sm:p-6 bg-background dark:bg-background-dark rounded-lg hover:bg-primary/5 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Debt Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {/* Debtor Avatar */}
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <span className="text-red-600 dark:text-red-400 font-semibold text-lg">
                          {debt.debtor?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      
                      {/* Arrow */}
                      <div className="text-textSecondary dark:text-textSecondary-dark text-2xl">→</div>
                      
                      {/* Creditor Avatar */}
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 font-semibold text-lg">
                          {debt.creditor?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-textPrimary dark:text-textPrimary-dark text-lg">
                        {debt.debtor} owes {debt.creditor}
                      </h3>
                      <p className="text-2xl font-bold text-red-500">
                        {formatCurrency(debt.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Settlement Actions */}
                  <div className="flex items-center gap-3">
                    {settlingDebt === index ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="number"
                          value={settlementAmount}
                          onChange={(e) => setSettlementAmount(e.target.value)}
                          placeholder="Amount"
                          min="0.01"
                          step="0.01"
                          className="px-3 py-2 bg-card dark:bg-card-dark border border-primary/20 rounded-lg text-textPrimary dark:text-textPrimary-dark w-24"
                        />
                        <button
                          onClick={() => handleSettleDebt(debt)}
                          disabled={settlingLoading}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                          {settlingLoading ? '...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => {
                            setSettlingDebt(null);
                            setSettlementAmount('');
                          }}
                          className="px-4 py-2 bg-background dark:bg-background-dark border border-primary/20 text-textSecondary dark:text-textSecondary-dark rounded-lg font-medium hover:border-primary/40 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSettlingDebt(index);
                          setSettlementAmount(debt.amount.toString());
                        }}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                      >
                        Settle Up
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      {activeDebts.length > 0 && (
        <div className="mt-6 bg-card dark:bg-card-dark rounded-xl p-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-2xl">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-textPrimary dark:text-textPrimary-dark mb-2">Smart Debt Optimization</h3>
              <p className="text-textSecondary dark:text-textSecondary-dark text-sm leading-relaxed">
                These debts have been optimized to minimize the number of transactions needed. 
                Instead of tracking every individual payment, we calculate who owes what overall 
                and show you the most efficient way to settle up.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtTracker;
