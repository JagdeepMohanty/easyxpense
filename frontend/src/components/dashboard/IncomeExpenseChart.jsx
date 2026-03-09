import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const IncomeExpenseChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg">
        <div className="h-6 w-48 bg-slate-700 rounded mb-6 animate-pulse"></div>
        <div className="h-80 bg-slate-800/50 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[#E2E8F0] mb-6">Income vs Expenses</h2>
        <div className="h-80 flex flex-col items-center justify-center">
          <p className="text-[#94A3B8] mb-2">No data available</p>
          <p className="text-sm text-[#94A3B8]">Add expenses to see trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg border border-slate-800/50">
      <h2 className="text-lg font-semibold text-[#E2E8F0] mb-6">Income vs Expenses</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
          <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
          <YAxis stroke="#94A3B8" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0F172A', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#E2E8F0'
            }}
          />
          <Legend />
          <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} name="Income" />
          <Bar dataKey="expense" fill="#EF4444" radius={[8, 8, 0, 0]} name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
