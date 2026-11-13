import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const SortDropdown = ({ value, onChange, options = [] }) => {
  return (
    <div className="relative inline-flex items-center">
      <div className="absolute left-3 pointer-events-none text-slate-400">
        <ArrowUpDown className="w-3.5 h-3.5" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium cursor-pointer transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;

