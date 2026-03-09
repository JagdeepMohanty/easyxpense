import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];

const CategoryChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg">
        <div className="h-6 w-40 bg-slate-700 rounded mb-6 animate-pulse"></div>
        <div className="h-80 bg-slate-800/50 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[#E2E8F0] mb-6">Spending by Category</h2>
        <div className="h-80 flex flex-col items-center justify-center">
          <p className="text-[#94A3B8] mb-2">No categories yet</p>
          <p className="text-sm text-[#94A3B8]">Add expenses to see breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg border border-slate-800/50">
      <h2 className="text-lg font-semibold text-[#E2E8F0] mb-6">Spending by Category</h2>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0F172A', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#E2E8F0'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
