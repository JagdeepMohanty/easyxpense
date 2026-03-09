import React from 'react';
import { formatCurrency } from '../../utils/currency';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const RecentTransactions = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg">
        <div className="h-6 w-48 bg-slate-700 rounded mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-slate-800/50 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg border border-slate-800/50">
        <h2 className="text-lg font-semibold text-[#E2E8F0] mb-6">Recent Transactions</h2>
        <div className="text-center py-12">
          <p className="text-[#94A3B8] mb-2">No transactions yet</p>
          <p className="text-sm text-[#94A3B8]">Your recent activity will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg border border-slate-800/50">
      <h2 className="text-lg font-semibold text-[#E2E8F0] mb-6">Recent Transactions</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left py-3 px-2 text-xs font-medium text-[#94A3B8] uppercase">Date</th>
              <th className="text-left py-3 px-2 text-xs font-medium text-[#94A3B8] uppercase">Description</th>
              <th className="text-left py-3 px-2 text-xs font-medium text-[#94A3B8] uppercase hidden sm:table-cell">Category</th>
              <th className="text-right py-3 px-2 text-xs font-medium text-[#94A3B8] uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={transaction._id || index} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-2 text-sm text-[#E2E8F0]">
                  {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${transaction.type === 'income' ? 'bg-[#10B981]/10' : 'bg-red-500/10'}`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="text-[#10B981]" size={16} />
                      ) : (
                        <ArrowDownRight className="text-red-400" size={16} />
                      )}
                    </div>
                    <span className="text-sm text-[#E2E8F0]">{transaction.description}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-sm text-[#94A3B8] hidden sm:table-cell">
                  {transaction.category || 'Other'}
                </td>
                <td className={`py-4 px-2 text-sm font-semibold text-right ${transaction.type === 'income' ? 'text-[#10B981]' : 'text-red-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
