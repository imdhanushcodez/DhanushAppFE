import React from 'react';
import { X } from 'lucide-react';

const FilterChips = ({ filters = [], onRemove, onClearAll }) => {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 pb-1">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>
      {filters.map((f) => (
        <span
          key={f.id}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
        >
          <span>
            <strong className="font-semibold text-indigo-900 dark:text-indigo-200">{f.label}:</strong> {f.value}
          </span>
          <button
            type="button"
            onClick={() => onRemove(f.id)}
            className="hover:text-indigo-900 dark:hover:text-indigo-200 focus:outline-none"
            title="Remove filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 underline ml-2 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
};

export default FilterChips;

