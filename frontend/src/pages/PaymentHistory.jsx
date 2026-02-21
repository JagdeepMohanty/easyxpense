import React, { useState, useEffect, useCallback } from 'react';
import { expensesAPI, settlementsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import Pagination from '../components/dashboard/Pagination';
import Header from '../components/Header';

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
      const response = await settlementsAPI.getHistory?.(null, page, limit) || { data: { data: [], totalPages: 1, total: 0 } };
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
    <div>
      <Header title="Payment History" />
      
      <div className="flex gap-2 mb-6 border-b border-primary/10 overflow-x-auto">
        <button
          className={`px-4 sm:px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'text-primary border-b-2 border-primary'
              : 'text-textSecondary dark:text-textSecondary-dark hover:text-textPrimary dark:hover:text-textPrimary-dark'
          }`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses ({expensesTotal})
        </button>
        <button
          className={`px-4 sm:px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'settlements'
              ? 'text-primary border-b-2 border-primary'
              : 'text-textSecondary dark:text-textSecondary-dark hover:text-textPrimary dark:hover:text-textPrimary-dark'
          }`}
          onClick={() => setActiveTab('settlements')}
        >
          Settlements ({settlementsTotal})
        </button>
      </div>

      <div className="bg-card dark:bg-card-dark rounded-xl p-4 sm:p-6 shadow-md">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-textSecondary dark:text-textSecondary-dark">Loading...</span>
          </div>
        ) : activeTab === 'expenses' ? (
          expenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💸</div>
              <div className="text-xl font-semibold text-textPrimary dark:text-textPrimary-dark mb-2">No expenses yet</div>
              <div className="text-textSecondary dark:text-textSecondary-dark">
                Your expense history will appear here once you add some.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map(expense => (
                <div 
                  key={expense._id} 
                  className="flex items-center justify-between p-4 bg-background dark:bg-background-dark rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💰</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-textPrimary dark:text-textPrimary-dark truncate">{expense.description}</h4>
                      <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                        Paid by {expense.payer} • {expense.participants?.length || 0} people
                      </p>
                      <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-1">{formatDate(expense.date)}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="font-semibold text-primary">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          settlements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <div className="text-xl font-semibold text-textPrimary dark:text-textPrimary-dark mb-2">No settlements yet</div>
              <div className="text-textSecondary dark:text-textSecondary-dark">
                Settlement records will show up here when you settle debts.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map(settlement => (
                <div 
                  key={settlement._id} 
                  className="flex items-center justify-between p-4 bg-background dark:bg-background-dark rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">✅</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-textPrimary dark:text-textPrimary-dark">Settlement</h4>
                      <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                        {settlement.fromUser} → {settlement.toUser}
                      </p>
                      <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-1">{formatDate(settlement.date)}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="font-semibold text-primary">
                      {formatCurrency(settlement.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {activeTab === 'expenses' ? (
        expensesTotalPages > 1 && (
          <Pagination
            currentPage={expensesPage}
            totalPages={expensesTotalPages}
            onPageChange={handleExpensesPageChange}
            loading={loading}
          />
        )
      ) : (
        settlementsTotalPages > 1 && (
          <Pagination
            currentPage={settlementsPage}
            totalPages={settlementsTotalPages}
            onPageChange={handleSettlementsPageChange}
            loading={loading}
          />
        )
      )}
    </div>
  );
};

export default React.memo(PaymentHistory);
