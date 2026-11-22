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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-900">{todayName}'s Workout</h3>
                {categoriesSubtitle && (
                  <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                    {categoriesSubtitle}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Planned gym routine</p>
            </div>
          </div>
          <Link
            to="/gym"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No workout planned for today</p>
            <p className="text-xs text-slate-400 mt-0.5">Enjoy your rest day or schedule a session.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {workouts.map((w, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{w.name}</p>
                  <p className="text-xs text-slate-500">
                    {w.reps} reps {(w.weightKg || w.weight_kg) ? `• ${w.weightKg || w.weight_kg} kg` : ''}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
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
