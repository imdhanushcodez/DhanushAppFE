import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start space-x-3 mb-6">
        <div className={`p-2.5 rounded-full shrink-0 ${isDanger ? 'bg-rose-500/15 dark:bg-rose-400/15 text-rose-600 dark:text-rose-400' : 'bg-amber-500/15 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400'}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{message}</p>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-3 border-t border-slate-900/10 dark:border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15 rounded-lg transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
            isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 btn-shine hover:bg-indigo-700'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

