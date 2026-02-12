import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Charts = ({ monthlyData = [], categoryData = [] }) => {
  const COLORS = ['#7C5CFF', '#8B5CF6', '#A855F7', '#10b981', '#f59e0b', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-darkcard border border-darkborder rounded-xl shadow-soft-lg p-3">
          <p className="text-sm font-medium text-darktext mb-1">
            {label}
          </p>
          <p className="text-sm text-accent-mid font-semibold">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-darkcard border border-darkborder rounded-xl shadow-soft-lg p-3">
          <p className="text-sm font-medium text-darktext mb-1">
            {payload[0].name}
          </p>
          <p className="text-sm text-accent-mid font-semibold">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-darkcard rounded-xl shadow-soft border border-darkborder p-6">
        <h3 className="text-lg font-semibold text-darktext mb-6">
          Monthly Spending
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#23283B" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              stroke="#23283B"
            />
            <YAxis
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              stroke="#23283B"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 92, 255, 0.1)' }} />
            <Bar dataKey="amount" fill="#7C5CFF" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-darkcard rounded-xl shadow-soft border border-darkborder p-6">
        <h3 className="text-lg font-semibold text-darktext mb-6">
          Category Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
