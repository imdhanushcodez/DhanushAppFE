import React, { useState, useEffect, useMemo } from 'react';
import VaultCard from '../components/vault/VaultCard';
import VaultModal from '../components/vault/VaultModal';
import VaultExportModal from '../components/vault/VaultExportModal';
import VaultImportModal from '../components/vault/VaultImportModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SearchBar from '../components/common/SearchBar';
import SortDropdown from '../components/common/SortDropdown';
import FilterChips from '../components/common/FilterChips';
import { vaultApi } from '../api/vaultApi';
import { KeyRound, Plus, Upload, Download, Filter } from 'lucide-react';

const VaultPage = () => {
  const [entries, setEntries] = useState([]);
  const [sources, setSources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, entry: null });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();

      // Sort
      if (sortOption === 'source_asc' || sortOption === 'sourceAsc') params.sort = 'sourceAsc';
      else if (sortOption === 'source_desc' || sortOption === 'sourceDesc') params.sort = 'sourceDesc';
      else if (sortOption === 'oldest') params.sort = 'oldest';
      else if (sortOption === 'updated') params.sort = 'updated';
      else params.sort = 'newest';

      if (selectedSource !== 'ALL') {
        params.source = selectedSource;
      }

      if (dateFilter !== 'ALL') {
        const now = new Date();
        if (dateFilter === 'today') {
          params.addedFrom = now.toISOString().split('T')[0];
        } else if (dateFilter === '7days') {
          const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          params.addedFrom = d.toISOString().split('T')[0];
        } else if (dateFilter === '30days') {
          const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          params.addedFrom = d.toISOString().split('T')[0];
        }
      }

      const [res, srcList] = await Promise.all([
        vaultApi.getAll(params),
        vaultApi.getSources().catch(() => []),
      ]);

      const items = res.items || res || [];
      setEntries(items);
      if (Array.isArray(srcList) && srcList.length > 0) {
        setSources(srcList);
      }
    } catch (err) {
      console.error('Failed to load vault entries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, sortOption, selectedSource, dateFilter]);

  // Distinct sources for filter dropdown
  const uniqueSources = useMemo(() => {
    if (sources && sources.length > 0) return sources;
    return Array.from(new Set(entries.map((e) => e.source))).filter(Boolean);
  }, [sources, entries]);

  // Active filters list
  const activeFilters = useMemo(() => {
    const list = [];
    if (selectedSource !== 'ALL') {
      list.push({ id: 'source', label: 'Source', value: selectedSource });
    }
    if (dateFilter !== 'ALL') {
      const labels = { today: 'Today', '7days': 'Last 7 days', '30days': 'Last 30 days' };
      list.push({ id: 'date', label: 'Date', value: labels[dateFilter] || dateFilter });
    }
    return list;
  }, [selectedSource, dateFilter]);

  const handleRemoveFilter = (filterId) => {
    if (filterId === 'source') setSelectedSource('ALL');
    if (filterId === 'date') setDateFilter('ALL');
  };

  const handleClearAllFilters = () => {
    setSelectedSource('ALL');
    setDateFilter('ALL');
    setSearchQuery('');
  };

  // Add / Edit
  const handleSaveEntry = async (data) => {
    try {
      if (editingEntry) {
        await vaultApi.update(editingEntry.id, data);
        showToast('Password entry updated successfully');
      } else {
        await vaultApi.create(data);
        showToast('New password added successfully');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save password entry';
      showToast(msg);
    }
  };

  // Delete
  const handleDeleteClick = (entry) => {
    setDeleteConfirm({ isOpen: true, entry });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.entry) {
      try {
        await vaultApi.delete(deleteConfirm.entry.id);
        showToast('Password deleted');
        setDeleteConfirm({ isOpen: false, entry: null });
        loadData();
      } catch (err) {
        showToast('Failed to delete password');
      }
    }
  };

  // Export (US-26)
  const handleExportConfirmed = async (accountPassword) => {
    try {
      const blob = await vaultApi.exportCsv(accountPassword);
      const today = new Date().toISOString().split('T')[0];
      const filename = `passwords-${today}.csv`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(`Exported passwords to ${filename}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to export passwords. Check your password.';
      showToast(msg);
    }
  };

  // Import success callback
  const handleImportSuccess = (result) => {
    showToast(`${result.imported} imported, ${result.skipped} skipped`);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Passwords Vault</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Securely store and manage your credentials</p>
            </div>
          </div>
        </div>

        {/* Action buttons (Add, Import, Export) */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 glass border border-slate-900/10 dark:border-white/10 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 glass border border-slate-900/10 dark:border-white/10 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setEditingEntry(null);
              setModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 btn-shine hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Password</span>
          </button>
        </div>
      </div>

      {/* Search, Filter, Sort Toolbar */}
      <div className="glass p-4 rounded-3xl border border-slate-900/10 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search passwords by source or id..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Source */}
            <div className="relative">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="appearance-none text-xs bg-white/40 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl px-3 py-2 pr-8 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Sources</option>
                {uniqueSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter by Date added */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none text-xs bg-white/40 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl px-3 py-2 pr-8 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Dates</option>
                <option value="today">Added Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
              <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Options */}
            <SortDropdown
              value={sortOption}
              onChange={setSortOption}
              options={[
                { value: 'newest', label: 'Newest first' },
                { value: 'oldest', label: 'Oldest first' },
                { value: 'source_asc', label: 'Source (A-Z)' },
                { value: 'source_desc', label: 'Source (Z-A)' },
                { value: 'updated', label: 'Recently updated' },
              ]}
            />
          </div>
        </div>

        {/* Active Filter Chips */}
        <FilterChips
          filters={activeFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />
      </div>

      {/* Passwords Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading passwords...</div>
      ) : entries.length === 0 ? (
        <div className="glass rounded-3xl border border-dashed border-slate-900/10 dark:border-white/10 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-3xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">No passwords found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {activeFilters.length > 0 || searchQuery
              ? 'Try adjusting your search query or filters to find what you are looking for.'
              : 'Keep your login credentials secure in one place. Add your first password now.'}
          </p>
          {(activeFilters.length > 0 || searchQuery) && (
            <button
              onClick={handleClearAllFilters}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {entries.map((entry) => (
            <VaultCard
              key={entry.id}
              entry={{
                ...entry,
                login_id: entry.loginId || entry.login_id,
              }}
              onEdit={(e) => {
                setEditingEntry(e);
                setModalOpen(true);
              }}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <VaultModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEntry}
        editingEntry={editingEntry}
      />

      <VaultExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExportConfirmed}
      />

      <VaultImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, entry: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Password"
        message={`Are you sure you want to delete the password for "${deleteConfirm.entry?.source}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default VaultPage;
