import React, { useState, useEffect, useCallback } from 'react';
import { expensesAPI, settlementsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import Pagination from '../components/dashboard/Pagination';

const PaymentHistory = () => {
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [loading, setLoading] = useState(true);
  const [expensesPage, setExpensesPage] = useState(1);
  const [expensesTotalPages, setExpensesTotalPages] = useState(1);
  const [expensesTotal, setExpensesTotal] = useState(0);
  const [settlementsPage, setSettlementsPage] = useState(1);
  const [settlementsTotalPages, setSettlementsTotalPages] = useState(1);
  const [settlementsTotal, setSettlementsTotal] = useState(0);
  const limit = 10;

  const fetchExpenses = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await expensesAPI.getAll(null, page, limit);
      const { data, totalPages, total } = response.data;
      setExpenses(Array.isArray(data) ? data : []);
      setExpensesTotalPages(totalPages || 1);
      setExpensesTotal(total || 0);
      setExpensesPage(page);
    } catch (err) {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const fetchSettlements = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await settlementsAPI.getHistory(null, page, limit);
      const { data, totalPages, total } = response.data;
      setSettlements(Array.isArray(data) ? data : []);
      setSettlementsTotalPages(totalPages || 1);
      setSettlementsTotal(total || 0);
      setSettlementsPage(page);
    } catch (err) {
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (activeTab === 'expenses') {
      fetchExpenses();
    } else {
      fetchSettlements();
    }
  }, [activeTab, fetchExpenses, fetchSettlements]);

  const handleExpensesPageChange = useCallback((page) => {
    fetchExpenses(page);
  }, [fetchExpenses]);

  const handleSettlementsPageChange = useCallback((page) => {
    fetchSettlements(page);
  }, [fetchSettlements]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="payment-history">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment History</h1>
        <p className="text-gray-600">View all your expenses and settlements</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'expenses'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses ({expensesTotal})
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'settlements'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('settlements')}
        >
          Settlements ({settlementsTotal})
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              Loading...
            </div>
          ) : activeTab === 'expenses' ? (
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

      {activeTab === 'expenses' ? (
        <Pagination
          currentPage={expensesPage}
          totalPages={expensesTotalPages}
          onPageChange={handleExpensesPageChange}
          loading={loading}
        />
      ) : (
        <Pagination
          currentPage={settlementsPage}
          totalPages={settlementsTotalPages}
          onPageChange={handleSettlementsPageChange}
          loading={loading}
        />
      )}
    </div>
  );
};

export default React.memo(PaymentHistory);
