import React, { useState } from 'react';
import Modal from '../common/Modal';
import { notesApi } from '../../api/notesApi';
import { Upload, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';

const NotesImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await notesApi.getTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'notes-import-template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Failed to download notes template', err);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file.');
      return;
    }

    if (selectedFile.size > 1024 * 1024) {
      setError('File size must be less than 1 MB.');
      return;
    }

    setError('');
    setFile(selectedFile);
    setLoading(true);

    try {
      const previewData = await notesApi.importCsv(selectedFile, true);
      setPreview(previewData);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to parse CSV file.';
      setError(detail);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!file || !preview || preview.validRows === 0) return;
    setLoading(true);
    try {
      const result = await notesApi.importCsv(file, false);
      if (onImportSuccess) {
        onImportSuccess(result);
      }
      handleClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Notes from CSV" maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Template download banner */}
        <div className="flex items-center justify-between p-3.5 bg-white/40 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl">
          <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Need the format? CSV headers must be <strong>topic, notes</strong>.</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 shrink-0 ml-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Template</span>
          </button>
        </div>

        {/* File picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            Select CSV File (Max 1MB)
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
        </div>

        {loading && <p className="text-xs text-indigo-600 dark:text-indigo-400">Processing file...</p>}

        {/* Validation Summary */}
        {preview && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-white/40 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl">
                <span className="block text-base font-bold text-slate-900 dark:text-slate-50">{preview.totalRows}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Rows</span>
              </div>
              <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/25 rounded-xl text-emerald-800 dark:text-emerald-300">
                <span className="block text-base font-bold text-emerald-700 dark:text-emerald-300">{preview.validRows}</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Ready to Import</span>
              </div>
              <div className="p-2.5 bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/25 rounded-xl text-amber-800 dark:text-amber-300">
                <span className="block text-base font-bold text-amber-700 dark:text-amber-300">{preview.duplicateRows}</span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400">Duplicates</span>
              </div>
              <div className="p-2.5 bg-rose-500/10 dark:bg-rose-400/10 border border-rose-500/25 rounded-xl text-rose-800 dark:text-rose-300">
                <span className="block text-base font-bold text-rose-700 dark:text-rose-300">{preview.invalidRows}</span>
                <span className="text-[11px] text-rose-600 dark:text-rose-400">Errors</span>
              </div>
            </div>

            {/* Error list */}
            {preview.errors && preview.errors.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-rose-500/10 dark:bg-rose-400/10 border border-rose-500/25 rounded-xl">
                <p className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">Issues found:</p>
                {preview.errors.map((item, idx) => (
                  <p key={idx} className="text-[11px] text-rose-700 dark:text-rose-300">
                    Row {item.row}: {item.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-900/10 dark:border-white/10">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!preview || preview.validRows === 0 || loading}
            className={`flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              preview && preview.validRows > 0 && !loading
                ? 'bg-indigo-600 btn-shine hover:bg-indigo-700'
                : 'bg-indigo-300 cursor-not-allowed'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import {preview?.validRows || 0} Notes</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NotesImportModal;
