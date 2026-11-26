import React, { useState, useEffect, useMemo, useCallback } from 'react';
import NoteCard from '../components/notes/NoteCard';
import NoteModal from '../components/notes/NoteModal';
import NotesImportModal from '../components/notes/NotesImportModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SearchBar from '../components/common/SearchBar';
import SortDropdown from '../components/common/SortDropdown';
import FilterChips from '../components/common/FilterChips';
import { notesApi } from '../api/notesApi';
import { FileText, Plus, Upload, Download, Loader2 } from 'lucide-react';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [dateFilter, setDateFilter] = useState('ALL');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, note: null });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      // Map sortOption
      if (sortOption === 'oldest') params.sort = 'oldest';
      else if (sortOption === 'topic_asc') params.sort = 'topicAsc';
      else if (sortOption === 'topic_desc') params.sort = 'topicDesc';
      else if (sortOption === 'updated') params.sort = 'updated';
      else params.sort = 'newest';

      if (dateFilter !== 'ALL') {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        params.addedTo = todayStr;
        if (dateFilter === 'today') {
          params.addedFrom = todayStr;
        } else if (dateFilter === '7days') {
          const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          params.addedFrom = d.toISOString().split('T')[0];
        } else if (dateFilter === '30days') {
          const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          params.addedFrom = d.toISOString().split('T')[0];
        }
      }

      const res = await notesApi.getAll(params);
      const items = Array.isArray(res) ? res : res.items || [];
      setNotes(items);
    } catch (err) {
      console.error('Failed to load notes', err);
      showToast(err.response?.data?.detail || 'Failed to load notes from server.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortOption, dateFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timeout);
  }, [loadData]);

  const activeFilters = useMemo(() => {
    const list = [];
    if (dateFilter !== 'ALL') {
      const labels = { today: 'Today', '7days': 'Last 7 days', '30days': 'Last 30 days' };
      list.push({ id: 'date', label: 'Date', value: labels[dateFilter] || dateFilter });
    }
    return list;
  }, [dateFilter]);

  // Handlers
  const handleEditClick = async (note) => {
    try {
      const full = await notesApi.getById(note.id);
      setEditingNote(full);
    } catch {
      setEditingNote(note);
    }
    setModalOpen(true);
  };

  const handleSaveNote = async (data) => {
    try {
      const payload = {
        topic: data.topic,
        notes: data.content,
      };

      if (editingNote) {
        await notesApi.update(editingNote.id, payload);
        showToast('Note updated successfully');
      } else {
        await notesApi.create(payload);
        showToast('New note created successfully');
      }
      setEditingNote(null);
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to save note', err);
      showToast(err.response?.data?.detail || 'Failed to save note.');
    }
  };

  const handleDeleteClick = (note) => {
    setDeleteConfirm({ isOpen: true, note });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.note) return;
    try {
      await notesApi.delete(deleteConfirm.note.id);
      showToast('Note deleted successfully');
      setDeleteConfirm({ isOpen: false, note: null });
      loadData();
    } catch (err) {
      console.error('Failed to delete note', err);
      showToast(err.response?.data?.detail || 'Failed to delete note.');
    }
  };

  // Export (US-27)
  const handleExportCsv = async () => {
    try {
      const blob = await notesApi.exportCsv();
      const today = new Date().toISOString().split('T')[0];
      const filename = `notes-${today}.csv`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Exported notes to ${filename}`);
    } catch (err) {
      console.error('Failed to export notes', err);
      showToast(err.response?.data?.detail || 'Failed to export notes.');
    }
  };

  // Import (US-28)
  const handleImportSuccess = (result) => {
    const imported = result?.imported ?? result?.importedCount ?? 0;
    const skipped = result?.skipped ?? result?.skippedCount ?? 0;
    showToast(`Imported ${imported} note(s), ${skipped} skipped.`);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Personal Notes</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Capture ideas, logs, and important information</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 glass border border-slate-900/10 dark:border-white/10 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Import</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 glass border border-slate-900/10 dark:border-white/10 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setEditingNote(null);
              setModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 btn-shine rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass p-4 rounded-3xl border border-slate-900/10 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notes by topic or content..."
          />

          <div className="flex items-center space-x-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs font-medium bg-white/40 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
            </select>

            <SortDropdown
              value={sortOption}
              onChange={setSortOption}
              options={[
                { value: 'newest', label: 'Newest first' },
                { value: 'oldest', label: 'Oldest first' },
                { value: 'topic_asc', label: 'Topic A to Z' },
                { value: 'topic_desc', label: 'Topic Z to A' },
                { value: 'updated', label: 'Recently updated' },
              ]}
            />
          </div>
        </div>

        <FilterChips
          filters={activeFilters}
          onRemove={() => setDateFilter('ALL')}
          onClearAll={() => {
            setDateFilter('ALL');
            setSearchQuery('');
          }}
        />
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
          <p className="text-xs">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="py-16 text-center glass rounded-3xl border border-dashed border-slate-900/10 dark:border-white/10">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No notes found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || dateFilter !== 'ALL'
              ? 'Try adjusting your search or filters.'
              : 'Click "+ Add Note" to create your first note.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <NoteModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        editingNote={editingNote}
      />

      <NotesImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, note: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Note"
        message={
          deleteConfirm.note
            ? `Delete the note "${deleteConfirm.note.topic}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  );
};

export default NotesPage;
