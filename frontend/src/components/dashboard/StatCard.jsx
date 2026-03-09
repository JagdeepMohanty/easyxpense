import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg animate-pulse">
        <div className="h-4 w-24 bg-slate-700 rounded mb-4"></div>
        <div className="h-8 w-32 bg-slate-700 rounded mb-2"></div>
        <div className="h-3 w-20 bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-800/50">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-[#94A3B8]">{title}</h3>
        {Icon && <Icon className="text-[#10B981]" size={20} />}
      </div>
      <p className="text-3xl font-bold text-[#E2E8F0] mb-2">{value}</p>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-[#10B981]' : 'text-red-400'}`}>
          <span>{trend === 'up' ? '↑' : '↓'}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
