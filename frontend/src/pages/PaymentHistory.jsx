import React, { useState, useEffect } from 'react';
import { settlementsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import MainLayout from '../layouts/MainLayout';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';

const PaymentHistory = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const response = await settlementsAPI.getHistory('', 1, 100);
      setSettlements(response.data.settlements || response.data || []);
    } catch (err) {
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSettlements = settlements.filter(s =>
    s.fromUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.toUser?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
        <div>
          <h1 className="text-2xl font-semibold text-text-main">Payment History</h1>
          <p className="text-text-muted mt-1">View all your settlement records</p>
        </div>

        {settlements.length > 0 && (
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}

        {settlements.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No payment history"
            description="Settlement records will appear here once you start settling debts"
          />
        ) : filteredSettlements.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No results found"
            description={`No settlements match "${searchTerm}"`}
          />
        ) : (
          <div className="bg-card rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-main border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSettlements.map((settlement, index) => (
                    <tr key={settlement._id || index} className="hover:bg-main transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                        {formatDate(settlement.created_at || settlement.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-red-500 font-semibold text-sm">
                              {settlement.fromUser?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-text-main">
                            {settlement.fromUser}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary font-semibold text-sm">
                              {settlement.toUser?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-text-main">
                            {settlement.toUser}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-primary">
                        {formatCurrency(settlement.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PaymentHistory;
