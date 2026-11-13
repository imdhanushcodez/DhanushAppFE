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
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Warning:</strong> The downloaded CSV file will contain your passwords in readable, decrypted plain text.
            Keep the exported file secure and do not share it.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
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

