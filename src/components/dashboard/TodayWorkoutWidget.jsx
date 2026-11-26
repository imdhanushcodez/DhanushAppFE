import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { DAYS_OF_WEEK, getTodayDayOfWeek } from '../../utils/dateFormatter';

const TodayWorkoutWidget = ({ workouts = [] }) => {
  const todayId = getTodayDayOfWeek();
  const todayName = DAYS_OF_WEEK.find((d) => d.id === todayId)?.name || 'Today';

  // US-36: Categories joined by + (e.g., "Chest + Biceps")
  const uniqueCategories = Array.from(
    new Set(workouts.map((w) => w.category || w.categoryName || w.category_name).filter(Boolean))
  );
  const categoriesSubtitle = uniqueCategories.length > 0 ? uniqueCategories.join(' + ') : '';

  return (
    <div className="glass rounded-3xl border border-slate-900/10 dark:border-white/10 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">{todayName}'s Workout</h3>
                {categoriesSubtitle && (
                  <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500/15 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300 rounded-md">
                    {categoriesSubtitle}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Planned gym routine</p>
            </div>
          </div>
          <Link
            to="/gym"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div className="py-8 text-center bg-white/40 dark:bg-white/5 rounded-xl border border-dashed border-slate-900/10 dark:border-white/10">
            <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No workout planned for today</p>
            <p className="text-xs text-slate-400 mt-0.5">Enjoy your rest day or schedule a session.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {workouts.map((w, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-slate-900/10 dark:border-white/10"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{w.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {w.reps} reps {(w.weightKg || w.weight_kg) ? `• ${w.weightKg || w.weight_kg} kg` : ''}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 rounded-md">
                  Planned
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayWorkoutWidget;
