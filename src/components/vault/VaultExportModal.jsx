import React, { useState } from 'react';
import Modal from '../common/Modal';
import { ShieldAlert, Download } from 'lucide-react';

const VaultExportModal = ({ isOpen, onClose, onExport }) => {
  const [accountPassword, setAccountPassword] = useState('');
  const [error, setError] = useState('');

  const handleExport = (e) => {
    e.preventDefault();
    if (!accountPassword.trim()) {
      setError('Please enter your account password to verify your identity.');
      return;
    }
    onExport(accountPassword);
    setAccountPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Passwords Backup" maxWidth="max-w-md">
      <form onSubmit={handleExport} className="space-y-4">
        <div className="p-3.5 bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/25 rounded-xl flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Warning:</strong> The downloaded CSV file will contain your passwords in readable, decrypted plain text.
            Keep the exported file secure and do not share it.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            Confirm Account Password <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            placeholder="Enter your current login password"
            value={accountPassword}
            onChange={(e) => {
              setAccountPassword(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-3.5 py-2 text-sm glass border border-slate-900/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-900/10 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 btn-shine hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Verify & Download CSV</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VaultExportModal;

