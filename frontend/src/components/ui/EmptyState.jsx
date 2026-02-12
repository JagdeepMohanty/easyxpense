import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon = '📊', 
  title = 'No data yet', 
  description = 'Get started by adding your first item',
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div className="text-center py-16 px-6 animate-fade-in">
      <div className="text-6xl mb-4 opacity-50 animate-scale-in">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {(actionText && (actionLink || onAction)) && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-soft"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-soft"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;
