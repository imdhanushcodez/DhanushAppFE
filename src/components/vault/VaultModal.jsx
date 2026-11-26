import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { vaultApi } from '../../api/vaultApi';

const VaultModal = ({ isOpen, onClose, onSave, editingEntry }) => {
  const [formData, setFormData] = useState({
    source: '',
    login_id: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingEntry) {
      setFormData({
        source: editingEntry.source || '',
        login_id: editingEntry.loginId || editingEntry.login_id || '',
        password: editingEntry.password || '',
      });
      if (!editingEntry.password && editingEntry.id) {
        vaultApi.getPassword(editingEntry.id).then((res) => {
          if (res?.password) {
            setFormData((prev) => ({ ...prev, password: res.password }));
          }
        }).catch(() => {});
      }
    } else {
      setFormData({ source: '', login_id: '', password: '' });
    }
    setErrors({});
  }, [editingEntry, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.source.trim()) newErrors.source = 'Source is required';
    if (!formData.login_id.trim()) newErrors.login_id = 'Id / Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      source: formData.source.trim(),
      loginId: formData.login_id.trim(),
      login_id: formData.login_id.trim(),
      password: formData.password,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEntry ? 'Edit Password' : 'Add New Password'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            Source <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="source"
            placeholder="e.g. Gmail, Netflix, GitHub, Bank"
            value={formData.source}
            onChange={handleChange}
            className={`w-full px-3.5 py-2 text-sm glass border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
              errors.source ? 'border-rose-400/60 focus:border-rose-500' : 'border-slate-900/10 dark:border-white/10 focus:border-indigo-500'
            }`}
          />
          {errors.source && <p className="text-xs text-rose-500 mt-1">{errors.source}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            Id / Username / Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="login_id"
            placeholder="e.g. user@example.com or username"
            value={formData.login_id}
            onChange={handleChange}
            className={`w-full px-3.5 py-2 text-sm glass border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
              errors.login_id ? 'border-rose-400/60 focus:border-rose-500' : 'border-slate-900/10 dark:border-white/10 focus:border-indigo-500'
            }`}
          />
          {errors.login_id && <p className="text-xs text-rose-500 mt-1">{errors.login_id}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            Password <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3.5 py-2 text-sm font-mono glass border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
              errors.password ? 'border-rose-400/60 focus:border-rose-500' : 'border-slate-900/10 dark:border-white/10 focus:border-indigo-500'
            }`}
          />
          {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
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
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 btn-shine hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            {editingEntry ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VaultModal;
