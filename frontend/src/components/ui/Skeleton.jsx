import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-darkcard rounded-xl shadow-soft border border-darkborder p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-darksecondary rounded-xl"></div>
      <div className="w-16 h-4 bg-darksecondary rounded"></div>
    </div>
    <div className="h-4 bg-darksecondary rounded w-24 mb-3"></div>
    <div className="h-8 bg-darksecondary rounded w-32"></div>
  </div>
);

export const SkeletonTable = () => (
  <div className="bg-darkcard rounded-xl shadow-soft border border-darkborder overflow-hidden animate-pulse">
    <div className="p-6 border-b border-darkborder">
      <div className="h-6 bg-darksecondary rounded w-48 mb-4"></div>
      <div className="flex gap-3">
        <div className="h-10 bg-darksecondary rounded w-64"></div>
        <div className="h-10 bg-darksecondary rounded w-32"></div>
      </div>
    </div>
    <div className="p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-darksecondary rounded"></div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-darkcard rounded-xl shadow-soft border border-darkborder p-6 animate-pulse">
    <div className="h-6 bg-darksecondary rounded w-40 mb-6"></div>
    <div className="h-64 bg-darksecondary rounded"></div>
  </div>
);
