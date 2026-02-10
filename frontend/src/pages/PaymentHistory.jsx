import React, { useState, useEffect } from 'react';
import { expensesAPI, settlementsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

const PaymentHistory = () => {
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FIX: Fetch history on mount and when navigating back to this page
  useEffect(() => {
    fetchHistory();
  }, []); // Empty deps is correct - fetchHistory is stable

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [expensesRes, settlementsRes] = await Promise.all([
        expensesAPI.getAll(),
        settlementsAPI.getHistory()
      ]);
      
      // FIX: Ensure we always set arrays, even if API returns unexpected format
      setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);
      setSettlements(Array.isArray(settlementsRes.data) ? settlementsRes.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load history');
      console.error('History error:', err);
      // FIX: Set empty arrays on error so UI doesn't break
      setExpenses([]);
      setSettlements([]);
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment History</h1>
        <p className="text-gray-600">View all your expenses and settlements</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'expenses'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses ({expenses.length})
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'settlements'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('settlements')}
        >
          Settlements ({settlements.length})
        </button>
      </div>

      {/* Content */}
      <div className="card">
        <div className="card-body">
          {activeTab === 'expenses' ? (
            expenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💸</div>
                <div className="empty-state-title">No expenses yet</div>
                <div className="empty-state-description">
                  Your expense history will appear here once you add some.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map(expense => (
                  <div 
                    key={expense._id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">💰</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{expense.description}</h4>
                        <p className="text-sm text-gray-600">
                          Paid by {expense.payer} • {expense.participants?.length || 0} people
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            settlements.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💳</div>
                <div className="empty-state-title">No settlements yet</div>
                <div className="empty-state-description">
                  Settlement records will show up here when you settle debts.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {settlements.map(settlement => (
                  <div 
                    key={settlement._id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">✅</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900">Settlement</h4>
                        <p className="text-sm text-gray-600">
                          {settlement.fromUser} → {settlement.toUser}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(settlement.date)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-success-600">
                        {formatCurrency(settlement.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;