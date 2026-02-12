import React, { useState } from 'react';
import { formatCurrency } from '../../utils/currency';
import EmptyState from '../ui/EmptyState';

const ExpenseTable = ({ expenses = [], onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilter = (value) => {
    setFilterType(value);
    onFilter?.(value);
  };

  if (!expenses.length) {
    return (
      <div className="bg-darkcard rounded-xl shadow-soft border border-darkborder">
        <EmptyState
          icon="📊"
          title="No expenses yet"
          description="Start by adding your first expense to track your spending"
          actionText="Add Expense"
          actionLink="/add-expense"
        />
      </div>
    );
  }

  return (
    <div className="bg-darkcard rounded-xl shadow-soft border border-darkborder overflow-hidden">
      <div className="p-6 border-b border-darkborder">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-darktext">
            Recent Expenses
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-4 py-2 bg-darksecondary border border-darkborder rounded-xl focus:ring-2 focus:ring-accent-mid focus:border-transparent outline-none transition-all text-sm text-darktext"
            />
            
            <select
              value={filterType}
              onChange={(e) => handleFilter(e.target.value)}
              className="px-4 py-2 bg-darksecondary border border-darkborder rounded-xl focus:ring-2 focus:ring-accent-mid focus:border-transparent outline-none transition-all text-sm text-darktext"
            >
              <option value="all">All Types</option>
              <option value="paid">Paid</option>
              <option value="owed">Owed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-darksecondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-darkmuted uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-darkmuted uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-darkmuted uppercase tracking-wider">
                Friends
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-darkmuted uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-darkborder">
            {expenses.map((expense, index) => (
              <tr
                key={expense._id || index}
                className="hover:bg-darksecondary transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-darktext">
                    {expense.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-darkmuted">
                    {new Date(expense.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-darkmuted">
                    {expense.friends?.length || 0} friends
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-darktext">
                    {formatCurrency(expense.amount)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;
