import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { mealsApi } from '../api/mealsApi';
import { uploadApi } from '../api/uploadApi';
import { DAYS_OF_WEEK, getTodayDayOfWeek } from '../utils/dateFormatter';
import { Utensils, Plus, Trash2, Edit2, Flame, Beef, Layers, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const DietPage = () => {
  const [selectedDay, setSelectedDay] = useState(getTodayDayOfWeek());
  const [categories, setCategories] = useState([]);
  const [foodLibrary, setFoodLibrary] = useState([]);
  const [plan, setPlan] = useState({ days: [] });
  const [loading, setLoading] = useState(false);

  // Modals
  const [addFoodModalOpen, setAddFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({
    categoryId: 1,
    dishName: '',
    weightG: 100,
    calories: 200,
    proteinG: 10,
    fiberG: 2,
    imageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [foodFormErrors, setFoodFormErrors] = useState({});

  // Add to plan modal
  const [addToPlanModalOpen, setAddToPlanModalOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState('');

  // Delete & Alert dialogs
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, food: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catsRes, foodsRes, planRes] = await Promise.all([
        mealsApi.getCategories().catch(() => []),
        mealsApi.getAll().catch(() => []),
        mealsApi.getPlan().catch(() => ({ days: [] })),
      ]);

      setCategories(catsRes);
      setFoodLibrary(foodsRes);
      setPlan(planRes);
      if (foodsRes.length > 0 && !selectedFoodId) {
        setSelectedFoodId(foodsRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load diet data', err);
      showToast('Failed to load meals and diet plan data.');
    } finally {
      setLoading(false);
    }
  }, [selectedFoodId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current day data from plan
  const currentDayData = useMemo(() => {
    return (
      plan?.days?.find((d) => d.day === selectedDay) || {
        day: selectedDay,
        totalCalories: 0,
        totalProtein: 0,
        entries: [],
      }
    );
  }, [plan, selectedDay]);

  const currentDayMeals = currentDayData.entries || [];
  const dayCalories = currentDayData.totalCalories || 0;
  const dayProtein = currentDayData.totalProtein || 0;

  // Save food to library (US-37, US-39)
  const handleSaveFood = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!foodForm.dishName.trim()) errors.dishName = 'Dish name is required';
    if (!foodForm.weightG || Number(foodForm.weightG) <= 0) errors.weightG = 'Weight must be > 0';
    if (foodForm.calories === '' || Number(foodForm.calories) < 0) errors.calories = 'Calories must be >= 0';
    if (foodForm.proteinG !== '' && Number(foodForm.proteinG) < 0) errors.proteinG = 'Protein must be >= 0';
    if (foodForm.fiberG !== '' && Number(foodForm.fiberG) < 0) errors.fiberG = 'Fiber must be >= 0';

    if (Object.keys(errors).length > 0) {
      setFoodFormErrors(errors);
      return;
    }

    try {
      let finalImageUrl = foodForm.imageUrl || null;

      if (selectedFile) {
        setUploadingImage(true);
        try {
          const uploadRes = await uploadApi.uploadImage(selectedFile, 'food');
          finalImageUrl = uploadRes.url;
        } catch (uploadErr) {
          console.error('Image upload failed', uploadErr);
          showToast('Image upload failed. Saving food without new image.');
        } finally {
          setUploadingImage(false);
        }
      }

      const payload = {
        categoryId: Number(foodForm.categoryId),
        dishName: foodForm.dishName.trim(),
        weightG: Number(foodForm.weightG),
        calories: Number(foodForm.calories),
        proteinG: foodForm.proteinG ? Number(foodForm.proteinG) : 0,
        fiberG: foodForm.fiberG ? Number(foodForm.fiberG) : 0,
        imageUrl: finalImageUrl,
      };

      if (editingFood) {
        await mealsApi.update(editingFood.id, payload);
        showToast('Food item updated successfully');
      } else {
        await mealsApi.create(payload);
        showToast('New food item added to library');
      }

      setAddFoodModalOpen(false);
      setEditingFood(null);
      setSelectedFile(null);
      setFoodForm({
        categoryId: categories[0]?.id || 1,
        dishName: '',
        weightG: 100,
        calories: 200,
        proteinG: 10,
        fiberG: 2,
        imageUrl: '',
      });
      setFoodFormErrors({});
      loadData();
    } catch (err) {
      console.error('Failed to save food', err);
      showToast(err.response?.data?.detail || 'Failed to save food.');
    }
  };

  // Delete food from library (US-40)
  const handleDeleteFood = (food) => {
    setDeleteConfirm({ isOpen: true, food });
  };

  const confirmDeleteFood = async () => {
    if (!deleteConfirm.food) return;
    try {
      await mealsApi.delete(deleteConfirm.food.id);
      showToast('Food item removed from library');
      setDeleteConfirm({ isOpen: false, food: null });
      loadData();
    } catch (err) {
      setDeleteConfirm({ isOpen: false, food: null });
      if (err.response?.status === 409 || err.response?.data?.error === 'FOOD_IN_USE') {
        setAlertModal({
          isOpen: true,
          title: 'Cannot Delete Food',
          message: 'This food item is used in a plan and cannot be deleted.',
        });
      } else {
        showToast(err.response?.data?.detail || 'Failed to delete food item.');
      }
    }
  };

  // Add food to day (US-41)
  const handleAddFoodToDay = async () => {
    if (!selectedFoodId) return;
    try {
      await mealsApi.addToPlan(selectedDay, selectedFoodId);
      showToast(`Added meal to ${DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name}`);
      setAddToPlanModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to add meal to day', err);
      showToast(err.response?.data?.detail || 'Failed to add meal to schedule.');
    }
  };

  // Remove food from day (US-43)
  const handleRemoveEntry = async (entryId) => {
    try {
      await mealsApi.removeFromPlan(entryId);
      showToast('Meal removed from plan');
      loadData();
    } catch (err) {
      console.error('Failed to remove meal', err);
      showToast(err.response?.data?.detail || 'Failed to remove meal.');
    }
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
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Diet & Nutrition Tracker</h1>
            <p className="text-xs text-slate-500">Track meals, calories, and macros across the week</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingFood(null);
              setSelectedFile(null);
              setFoodForm({
                categoryId: categories[0]?.id || 1,
                dishName: '',
                weightG: 100,
                calories: 200,
                proteinG: 10,
                fiberG: 2,
                imageUrl: '',
              });
              setFoodFormErrors({});
              setAddFoodModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Food Item</span>
          </button>
          <button
            onClick={() => setAddToPlanModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meal to {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name}</span>
          </button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex overflow-x-auto space-x-1.5 scrollbar-none">
        {DAYS_OF_WEEK.map((day) => {
          const dayPlanData = plan?.days?.find((p) => p.day === day.id);
          const count = dayPlanData?.entries?.length || 0;
          const isToday = getTodayDayOfWeek() === day.id;
          const isSelected = selectedDay === day.id;

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-center text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                <span>{day.name}</span>
                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-emerald-500'
                    }`}
                  />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 block ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                {count} {count === 1 ? 'meal' : 'meals'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Nutrition Summary Cards for the Day (US-44) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Total Energy</p>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {dayCalories} <span className="text-sm font-normal text-slate-500">kcal</span>
              </h3>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">Auto-calculated</span>
        </div>

        <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Beef className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Protein</p>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {dayProtein} <span className="text-sm font-normal text-slate-500">grams</span>
              </h3>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">Auto-calculated</span>
        </div>
      </div>

      {/* Meals Table for Selected Day */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name}'s Meals
            </h2>
            <p className="text-xs text-slate-500">
              {currentDayMeals.length} {currentDayMeals.length === 1 ? 'item' : 'items'} logged
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Loading meals...</p>
          </div>
        ) : currentDayMeals.length === 0 ? (
          <div className="py-16 text-center">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No meals planned for today</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Plan your food intake or click "+ Add Meal" to choose from the food library.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentDayMeals.map((entry) => (
              <div key={entry.entryId || entry.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {entry.imageUrl ? (
                    <img
                      src={entry.imageUrl}
                      alt={entry.dishName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Utensils className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-slate-800 text-sm">{entry.dishName}</h4>
                      {entry.category && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                          {entry.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                      <span>{entry.weightG}g serving</span>
                      <span>• {entry.calories} kcal</span>
                      <span>• {entry.proteinG}g protein</span>
                      {entry.fiberG ? <span>• {entry.fiberG}g fiber</span> : null}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveEntry(entry.entryId)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove meal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Food Library (US-38) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Shared Food Library</h3>
          </div>
          <span className="text-xs text-slate-400">{foodLibrary.length} items available</span>
        </div>

        {foodLibrary.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No items in food library yet. Create your first food item above!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {foodLibrary.map((f) => (
              <div
                key={f.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {f.categoryName || 'Food'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingFood(f);
                          setSelectedFile(null);
                          setFoodForm({
                            categoryId: f.categoryId,
                            dishName: f.dishName,
                            weightG: f.weightG,
                            calories: f.calories,
                            proteinG: f.proteinG || 0,
                            fiberG: f.fiberG || 0,
                            imageUrl: f.imageUrl || '',
                          });
                          setFoodFormErrors({});
                          setAddFoodModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                        title="Edit food"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFood(f)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete food"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {f.imageUrl && (
                    <img
                      src={f.imageUrl}
                      alt={f.dishName}
                      className="w-full h-24 object-cover rounded-lg mt-2 border border-slate-200"
                    />
                  )}
                  <h5 className="font-semibold text-slate-800 text-xs mt-2">{f.dishName}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {f.weightG}g • {f.calories} kcal • {f.proteinG}g protein
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Food Modal */}
      <Modal
        isOpen={addFoodModalOpen}
        onClose={() => setAddFoodModalOpen(false)}
        title={editingFood ? 'Edit Food Item' : 'Create New Food Item'}
      >
        <form onSubmit={handleSaveFood} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={foodForm.categoryId}
              onChange={(e) => setFoodForm({ ...foodForm, categoryId: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Dish Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Grilled Chicken Salad"
              value={foodForm.dishName}
              onChange={(e) => setFoodForm({ ...foodForm, dishName: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl ${
                foodFormErrors.dishName ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {foodFormErrors.dishName && (
              <p className="text-xs text-rose-500 mt-1">{foodFormErrors.dishName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Serving Weight (g) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={foodForm.weightG}
                onChange={(e) => setFoodForm({ ...foodForm, weightG: e.target.value })}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl ${
                  foodFormErrors.weightG ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {foodFormErrors.weightG && (
                <p className="text-xs text-rose-500 mt-1">{foodFormErrors.weightG}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Calories (kcal) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={foodForm.calories}
                onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl ${
                  foodFormErrors.calories ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {foodFormErrors.calories && (
                <p className="text-xs text-rose-500 mt-1">{foodFormErrors.calories}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={foodForm.proteinG}
                onChange={(e) => setFoodForm({ ...foodForm, proteinG: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Fiber (g)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={foodForm.fiberG}
                onChange={(e) => setFoodForm({ ...foodForm, fiberG: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Dish Image (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              {foodForm.imageUrl && !selectedFile && (
                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Has image</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddFoodModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingImage}
              className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center space-x-1.5"
            >
              {uploadingImage && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingFood ? 'Update Food' : 'Save Food'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Meal to Day Modal */}
      <Modal
        isOpen={addToPlanModalOpen}
        onClose={() => setAddToPlanModalOpen(false)}
        title={`Add Meal to ${DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Food / Dish
            </label>
            {foodLibrary.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No food items available. Please create one first.</p>
            ) : (
              <select
                value={selectedFoodId}
                onChange={(e) => setSelectedFoodId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              >
                {foodLibrary.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.dishName} ({f.categoryName} • {f.calories} kcal • {f.proteinG}g protein)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddToPlanModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={foodLibrary.length === 0}
              onClick={handleAddFoodToDay}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              Add Meal
            </button>
          </div>
        </div>
      </Modal>

      {/* Alert modal for cannot delete (US-40) */}
      <Modal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
        title={alertModal.title}
        maxWidth="max-w-md"
      >
        <div className="flex items-start space-x-3 py-2">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700">{alertModal.message}</p>
        </div>
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={() => setAlertModal({ isOpen: false, title: '', message: '' })}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg"
          >
            OK
          </button>
        </div>
      </Modal>

      {/* Confirm delete modal */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, food: null })}
        onConfirm={confirmDeleteFood}
        title="Delete Food"
        message={
          deleteConfirm.food
            ? `Delete "${deleteConfirm.food.dishName}" from the shared library?`
            : ''
        }
      />
    </div>
  );
};

export default DietPage;
