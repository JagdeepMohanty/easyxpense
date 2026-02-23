import React, { useState, useEffect } from 'react';
import { debtsAPI, settlementsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import MainLayout from '../layouts/MainLayout';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';

const DebtTracker = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settlingDebt, setSettlingDebt] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const response = await debtsAPI.getAll();
      const debtsData = response.data.debts || response.data || [];
      setDebts(Array.isArray(debtsData) ? debtsData : []);
    } catch (err) {
      setDebts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (debt) => {
    const amount = parseFloat(settlementAmount);
    if (!amount || amount <= 0 || amount > debt.amount) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      await settlementsAPI.create({
        fromUser: debt.debtor,
        toUser: debt.creditor,
        amount: amount
      });
      setSettlingDebt(null);
      setSettlementAmount('');
      await fetchDebts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to settle debt');
    } finally {
      setSubmitting(false);
    }
  };

  const activeDebts = debts.filter(d => d.amount > 0.01);
  const totalOwed = activeDebts.reduce((sum, d) => sum + d.amount, 0);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary dark:text-textPrimary-dark">Debt Tracker</h1>
          <p className="text-textSecondary dark:text-textSecondary-dark mt-1">Manage and settle your debts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-2">Pending Settlements</p>
            <p className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">{activeDebts.length}</p>
          </div>
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-2">Total Amount</p>
            <p className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">{formatCurrency(totalOwed)}</p>
          </div>
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-2">Optimization</p>
            <p className="text-2xl font-bold text-primary">Optimized</p>
          </div>
        </div>

        {/* Debts List */}
        {activeDebts.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="All settled up!"
            description="No outstanding debts. Everyone's square!"
          />
        ) : (
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-textPrimary dark:text-textPrimary-dark mb-6">Active Debts</h2>
            <div className="space-y-4">
              {activeDebts.map((debt, index) => (
                <div key={index} className="p-4 bg-background dark:bg-background-dark rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            {debt.debtor?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <span className="text-2xl text-textSecondary dark:text-textSecondary-dark">→</span>
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            {debt.creditor?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-textPrimary dark:text-textPrimary-dark">
                          {debt.debtor} owes {debt.creditor}
                        </p>
                        <p className="text-xl font-bold text-red-500">{formatCurrency(debt.amount)}</p>
                      </div>
                    </div>

                    {settlingDebt === index ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={settlementAmount}
                          onChange={(e) => setSettlementAmount(e.target.value)}
                          placeholder="Amount"
                          className="w-full sm:w-32"
                        />
                        <button
                          onClick={() => handleSettle(debt)}
                          disabled={submitting}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                        >
                          {submitting ? '...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => {
                            setSettlingDebt(null);
                            setSettlementAmount('');
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-textPrimary dark:text-textPrimary-dark rounded-lg font-medium transition-colors"
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
                        className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                      >
                        Settle
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DebtTracker;
