import React, { useState, useEffect } from 'react';
import { debtsAPI, settlementsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Input from '../components/ui/Input';

const DebtTracker = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settlingDebt, setSettlingDebt] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlingLoading, setSettlingLoading] = useState(false);

  // FIX: Fetch debts on mount and when navigating back to this page
  useEffect(() => {
    fetchDebts();
  }, []); // Empty deps is correct - fetchDebts is stable

  const fetchDebts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await debtsAPI.getAll();
      
      // FIX: Handle optimized response format correctly
      if (response.data.debts) {
        // Optimized format: {debts: [], balances: {}}
        setDebts(Array.isArray(response.data.debts) ? response.data.debts : []);
      } else if (Array.isArray(response.data)) {
        // Legacy format: direct array
        setDebts(response.data);
      } else {
        // Fallback: empty array
        setDebts([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load debts');
      console.error('Debts error:', err);
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
      // FIX: Refresh debts list after settlement to show updated data
      await fetchDebts();
    } catch (err) {
      alert(err.message || 'Failed to settle debt');
      console.error('Settlement error:', err);
    } finally {
      setSettlingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading debts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <span>⚠️</span>
        <div>
          <strong>Error loading debts</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const activeDebts = debts.filter(debt => debt.amount > 0.01);
  const totalAmount = debts.reduce((sum, debt) => sum + (debt.amount || 0), 0);

  return (
    <div className="debt-tracker">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Debt Tracker</h1>
        <p className="text-gray-600">Manage and settle outstanding debts with friends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Pending Settlements"
          value={activeDebts.length}
          icon="⚖️"
          changeType={activeDebts.length > 0 ? 'negative' : 'positive'}
          change={activeDebts.length > 0 ? 'Need attention' : 'All clear'}
        />
        
        <StatCard
          title="Total Amount"
          value={formatCurrency(totalAmount)}
          icon="💰"
          changeType={totalAmount > 0 ? 'negative' : 'neutral'}
        />
        
        <StatCard
          title="Optimization"
          value="60-90%"
          icon="⚡"
          changeType="positive"
          change="Fewer transactions"
        />
      </div>

      {/* Active Debts */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Active Debts</h2>
            {activeDebts.length > 0 && (
              <div className="text-sm text-gray-500">
                Optimized to minimize transactions
              </div>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {activeDebts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <div className="empty-state-title">All settled up!</div>
              <div className="empty-state-description">
                No outstanding debts. Everyone's square!
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDebts.map((debt, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    {/* Debt Info */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {/* Debtor Avatar */}
                        <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
                          <span className="text-danger-600 font-semibold text-lg">
                            {debt.debtor?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        
                        {/* Arrow */}
                        <div className="text-gray-400 text-2xl">→</div>
                        
                        {/* Creditor Avatar */}
                        <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                          <span className="text-success-600 font-semibold text-lg">
                            {debt.creditor?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {debt.debtor} owes {debt.creditor}
                        </h3>
                        <p className="text-2xl font-bold text-danger-600">
                          {formatCurrency(debt.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Settlement Actions */}
                    <div className="flex items-center gap-3">
                      {settlingDebt === index ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={settlementAmount}
                            onChange={(e) => setSettlementAmount(e.target.value)}
                            placeholder="Amount"
                            min="0.01"
                            step="0.01"
                            className="w-24"
                          />
                          <Button
                            onClick={() => handleSettleDebt(debt)}
                            variant="success"
                            size="sm"
                            loading={settlingLoading}
                          >
                            Confirm
                          </Button>
                          <Button
                            onClick={() => {
                              setSettlingDebt(null);
                              setSettlementAmount('');
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            setSettlingDebt(index);
                            setSettlementAmount(debt.amount.toString());
                          }}
                          variant="primary"
                          size="sm"
                          icon="✓"
                        >
                          Settle Up
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Info Card */}
      {activeDebts.length > 0 && (
        <Card className="mt-8">
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 text-2xl">💡</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Debt Optimization</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  These debts have been optimized to minimize the number of transactions needed. 
                  Instead of tracking every individual payment, we calculate who owes what overall 
                  and show you the most efficient way to settle up.
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default DebtTracker;