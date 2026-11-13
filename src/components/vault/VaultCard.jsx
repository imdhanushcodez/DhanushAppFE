import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Edit2, Trash2, Key } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { vaultApi } from '../../api/vaultApi';

const VaultCard = ({ entry, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState(entry.password || '');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchPasswordIfNeeded = async () => {
    if (decryptedPassword) return decryptedPassword;
    try {
      setLoadingPassword(true);
      const res = await vaultApi.getPassword(entry.id);
      const pass = res.password;
      setDecryptedPassword(pass);
      return pass;
    } catch (err) {
      console.error('Failed to reveal password', err);
      return '';
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleToggleShow = async () => {
    if (!showPassword) {
      await fetchPasswordIfNeeded();
    }
    setShowPassword((prev) => !prev);
  };

  const handleCopy = async () => {
    try {
      const pass = await fetchPasswordIfNeeded();
      if (pass) {
        await navigator.clipboard.writeText(pass);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            {entry.source ? entry.source.charAt(0).toUpperCase() : <Key className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {entry.source}
            </h4>
            <p className="text-sm text-slate-500 font-mono select-all">
              {entry.loginId || entry.login_id}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="Edit password"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(entry)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete password"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Password display & quick copy */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 font-mono text-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password:</span>
          <span className="text-slate-800 font-medium">
            {loadingPassword
              ? 'Loading...'
              : showPassword
              ? decryptedPassword
              : '••••••••••••'}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleToggleShow}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            title="Copy password to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-2 text-right">
        <span className="text-[11px] text-slate-400">
          Added: {formatDate(entry.createdAt || entry.created_at)}
        </span>
      </div>
    </div>
  );
};

export default VaultCard;
