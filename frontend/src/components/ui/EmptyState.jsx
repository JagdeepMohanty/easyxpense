import React from 'react';

const EmptyState = ({ 
  icon = '📭', 
  title = 'No data found', 
  description = 'Get started by adding your first item',
  action,
  actionLabel = 'Add New'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-textPrimary dark:text-textPrimary-dark mb-2">
        {title}
      </h3>
      <p className="text-textSecondary dark:text-textSecondary-dark text-center mb-6 max-w-md">
        {description}
      </p>
      {action && (
        <button
          onClick={action}
          className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
