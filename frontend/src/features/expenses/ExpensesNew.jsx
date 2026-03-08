import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expensesAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import MainLayout from '../../layouts/MainLayout';
import { Plus, Receipt, Calendar } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expensesAPI.getAll('', 1, 50);
      setExpenses(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-text-main">Expenses</h1>
            <p className="text-sm text-text-muted mt-1">
              Track and manage all your expenses
            </p>
          </div>
          <button
            onClick={() => navigate('/expenses/add')}
            className="flex items-center gap-2 px-5 h-11 bg-primary hover:bg-accent text-white rounded-lg font-medium transition-all duration-200"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {expenses.length === 0 ? (
          <div className="bg-card rounded-xl p-12 shadow-lg text-center">
            <Receipt className="mx-auto mb-4 text-text-muted" size={48} />
            <h3 className="text-lg font-medium text-text-main mb-2">No expenses yet</h3>
            <p className="text-sm text-text-muted mb-6">Start tracking your expenses by adding your first one</p>
            <button
              onClick={() => navigate('/expenses/add')}
              className="inline-flex items-center gap-2 px-5 h-11 bg-primary hover:bg-accent text-white rounded-lg font-medium transition-all duration-200"
            >
              <Plus size={20} />
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense._id} className="p-4 bg-main rounded-lg hover:bg-primary/5 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Receipt className="text-primary" size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium text-text-main">{expense.description}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                              <User size={14} />
                              {expense.paidBy || expense.payer || 'You'}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                              <Calendar size={14} />
                              {new Date(expense.date).toLocaleDateString()}
                            </span>
                            {expense.category && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                {expense.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">{formatCurrency(expense.amount)}</p>
                      {expense.friends && expense.friends.length > 0 && (
                        <p className="text-xs text-text-muted mt-1">
                          Split with {expense.friends.length} {expense.friends.length === 1 ? 'person' : 'people'}
                        </p>
                      )}
                    </div>
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

export default Expenses;
