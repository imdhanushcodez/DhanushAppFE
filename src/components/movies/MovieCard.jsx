import React from 'react';
import { Edit2, Trash2, Calendar, Star, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const statusConfig = {
  WANT_TO_WATCH: {
    label: 'Want to Watch',
    bgColor: 'bg-amber-500/10 dark:bg-amber-400/10',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-500/25',
    icon: Clock,
  },
  WATCHING: {
    label: 'Watching',
    bgColor: 'bg-blue-500/10 dark:bg-blue-400/10',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-500/25',
    icon: PlayCircle,
  },
  WATCHED: {
    label: 'Watched',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-500/25',
    icon: CheckCircle2,
  },
};

const MovieCard = ({ movie, onEdit, onDelete }) => {
  const statusInfo = statusConfig[movie.status] || statusConfig.WANT_TO_WATCH;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="glass rounded-3xl border border-slate-900/10 dark:border-white/10 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Title & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1 text-base">
              {movie.title}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                {movie.genre}
              </span>

              <span
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor}`}
              >
                <StatusIcon className="w-3 h-3" />
                <span>{statusInfo.label}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => onEdit(movie)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors"
              title="Edit movie"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(movie)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Delete movie"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rating */}
        <div className="mt-3 flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                movie.rating && star <= movie.rating
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200'
              }`}
            />
          ))}
          {movie.rating ? (
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1.5">
              {movie.rating} / 5
            </span>
          ) : (
            <span className="text-xs text-slate-400 ml-1.5 italic">Not rated</span>
          )}
        </div>

        {/* Review / Notes */}
        {movie.review && (
          <div className="mt-3 p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-slate-900/10 dark:border-white/10">
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line">
              "{movie.review}"
            </p>
          </div>
        )}
      </div>

      {/* Footer Dates */}
      <div className="mt-4 pt-3 border-t border-slate-900/10 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>Added {formatDate(movie.createdAt || movie.created_at)}</span>
        </span>
        {(movie.updatedAt || movie.updated_at) &&
          (movie.updatedAt || movie.updated_at) !== (movie.createdAt || movie.created_at) && (
            <span>Updated {formatDate(movie.updatedAt || movie.updated_at)}</span>
          )}
      </div>
    </div>
  );
};

export default MovieCard;
