import React from 'react';
import { Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const NoteCard = ({ note, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {note.topic}
            </h4>
          </div>

          <div className="flex items-center space-x-1 shrink-0 ml-2">
            <button
              onClick={() => onEdit(note)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="Edit note"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(note)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600 line-clamp-4 leading-relaxed whitespace-pre-line">
          {note.preview || note.notes || note.content}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(note.createdAt || note.created_at)}</span>
        </span>
        {(note.updatedAt || note.updated_at) &&
          (note.updatedAt || note.updated_at) !== (note.createdAt || note.created_at) && (
            <span>Updated {formatDate(note.updatedAt || note.updated_at)}</span>
          )}
      </div>
    </div>
  );
};

export default NoteCard;

