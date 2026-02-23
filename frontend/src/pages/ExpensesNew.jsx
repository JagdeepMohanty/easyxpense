import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { expensesAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import MainLayout from '../layouts/MainLayout';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';

const ExpensesNew = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, [page]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expensesAPI.getAll(searchTerm, page, 10);
      setExpenses(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    
    try {
      await expensesAPI.delete(id);
      fetchExpenses();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Memoized total calculation
  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    [expenses]
  );

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary dark:text-textPrimary-dark">Expenses</h1>
            <p className="text-textSecondary dark:text-textSecondary-dark mt-1">
              Total: {formatCurrency(totalExpenses)}
            </p>
          </div>
          <button
            onClick={() => navigate('/expenses/add')}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
          >
            + Add Expense
          </button>
        </div>

        {expenses.length > 0 && (
          <div className="flex gap-2">
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>
        )}

        {expenses.length === 0 ? (
          <EmptyState
            icon="💰"
            title="No expenses yet"
            description="Start tracking your expenses by adding your first one"
            action={() => navigate('/expenses/add')}
            actionLabel="Add First Expense"
          />
        ) : (
          <>
            <div className="bg-card dark:bg-card-dark rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary dark:text-textSecondary-dark uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary dark:text-textSecondary-dark uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary dark:text-textSecondary-dark uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-textSecondary dark:text-textSecondary-dark uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-textSecondary dark:text-textSecondary-dark uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {expenses.map((expense) => (
                      <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary dark:text-textPrimary-dark">
                          {formatDate(expense.date || expense.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-textPrimary dark:text-textPrimary-dark">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-primary">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-card dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-textPrimary dark:text-textPrimary-dark">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-card dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default React.memo(ExpensesNew);
