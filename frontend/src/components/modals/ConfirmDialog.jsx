import React from 'react';
import Button from '../ui/Button';

const ConfirmDialog = ({ title, message, onConfirm, onCancel, confirmText = 'Delete', confirmVariant = 'danger', loading = false }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-[#0F172A] rounded-xl shadow-lg border border-emerald-500/20 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-emerald-500/10">
          <h2 className="text-xl font-semibold text-textPrimary">{title}</h2>
          <button className="text-textSecondary hover:text-textPrimary text-2xl" onClick={onCancel}>&times;</button>
        </div>
        <div className="p-6">
          <p className="text-textSecondary">{message}</p>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="secondary" onClick={onCancel} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
