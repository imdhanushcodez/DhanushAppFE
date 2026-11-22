import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ArrowRight } from 'lucide-react';
import { DAYS_OF_WEEK, getTodayDayOfWeek } from '../../utils/dateFormatter';

const TodayDietWidget = ({ meals = [] }) => {
  const todayId = getTodayDayOfWeek();
  const todayName = DAYS_OF_WEEK.find((d) => d.id === todayId)?.name || 'Today';

  const totalCalories = meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (Number(m.proteinG || m.protein_g) || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-900">{todayName}'s Meals</h3>
                {meals.length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    {totalCalories} cal + {totalProtein} g protein
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Diet and nutrition targets</p>
            </div>
          </div>
          <Link
            to="/diet"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {meals.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No meals planned for today</p>
            <p className="text-xs text-slate-400 mt-0.5">Plan your breakfast, lunch and dinner.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
              <div>
                <span className="text-xs text-emerald-600 font-medium">Calories</span>
                <p className="text-base font-bold text-emerald-800">{totalCalories} kcal</p>
              </div>
              <div>
                <span className="text-xs text-emerald-600 font-medium">Protein</span>
                <p className="text-base font-bold text-emerald-800">{totalProtein} g</p>
              </div>
            </div>

            <div className="space-y-2">
              {meals.map((m, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs"
                >
                  <span className="font-medium text-slate-800 truncate max-w-[180px]">{m.dishName || m.dish_name}</span>
                  <span className="text-slate-500 font-mono">
                    {m.calories} cal | {m.proteinG || m.protein_g || 0}g P
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayDietWidget;
