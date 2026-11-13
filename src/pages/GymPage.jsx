import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { workoutsApi } from '../api/workoutsApi';
import { uploadApi } from '../api/uploadApi';
import { DAYS_OF_WEEK, getTodayDayOfWeek } from '../utils/dateFormatter';
import { Dumbbell, Plus, Trash2, Edit2, AlertCircle, Layers, Image as ImageIcon, Loader2 } from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const GymPage = () => {
  const [selectedDay, setSelectedDay] = useState(getTodayDayOfWeek());
  const [categories, setCategories] = useState([]);
  const [workoutsLibrary, setWorkoutsLibrary] = useState([]);
  const [plan, setPlan] = useState({ days: [] });
  const [loading, setLoading] = useState(false);

  // Modal states
  const [addWorkoutModalOpen, setAddWorkoutModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [workoutForm, setWorkoutForm] = useState({
    categoryId: 1,
    name: '',
    reps: 10,
    weightKg: '',
    imageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [workoutFormErrors, setWorkoutFormErrors] = useState({});

  // Add to plan modal
  const [addToPlanModalOpen, setAddToPlanModalOpen] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');

  // Alert/Error modal
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, workout: null });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catsRes, workoutsRes, planRes] = await Promise.all([
        workoutsApi.getCategories().catch(() => []),
        workoutsApi.getAll().catch(() => []),
        workoutsApi.getPlan().catch(() => ({ days: [] })),
      ]);

      setCategories(catsRes);
      setWorkoutsLibrary(workoutsRes);
      setPlan(planRes);
      if (workoutsRes.length > 0 && !selectedWorkoutId) {
        setSelectedWorkoutId(workoutsRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load gym data', err);
      showToast('Failed to load workouts and routine data.');
    } finally {
      setLoading(false);
    }
  }, [selectedWorkoutId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current day's entries from plan
  const currentDayData = useMemo(() => {
    return plan?.days?.find((d) => d.day === selectedDay) || { day: selectedDay, categories: [], entries: [] };
  }, [plan, selectedDay]);

  const currentDayPlan = currentDayData.entries || [];

  // US-34: Day header categories joined by "+" (each category once)
  const currentDayHeaderTitle = useMemo(() => {
    const dayName = DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name || '';
    if (!currentDayPlan || currentDayPlan.length === 0) return `${dayName}: No workout planned`;

    if (currentDayData.categories && currentDayData.categories.length > 0) {
      return `${dayName}: ${currentDayData.categories.join(' + ')}`;
    }

    const catNames = [];
    currentDayPlan.forEach((entry) => {
      const name = entry.category || 'Workout';
      if (!catNames.includes(name)) catNames.push(name);
    });

    return `${dayName}: ${catNames.join(' + ')}`;
  }, [selectedDay, currentDayPlan, currentDayData]);

  // US-29 & US-31: Save Workout to Shared Library
  const handleSaveWorkout = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!workoutForm.name.trim()) errors.name = 'Workout name is required';
    if (!workoutForm.reps || Number(workoutForm.reps) <= 0) errors.reps = 'Reps must be greater than 0';
    if (workoutForm.weightKg && Number(workoutForm.weightKg) <= 0) {
      errors.weightKg = 'Weight, if entered, must be greater than 0';
    }

    if (Object.keys(errors).length > 0) {
      setWorkoutFormErrors(errors);
      return;
    }

    try {
      let finalImageUrl = workoutForm.imageUrl || null;

      if (selectedFile) {
        setUploadingImage(true);
        try {
          const uploadRes = await uploadApi.uploadImage(selectedFile, 'workout');
          finalImageUrl = uploadRes.url;
        } catch (uploadErr) {
          console.error('Image upload failed', uploadErr);
          showToast('Image upload failed. Saving workout without new image.');
        } finally {
          setUploadingImage(false);
        }
      }

      const payload = {
        categoryId: Number(workoutForm.categoryId),
        name: workoutForm.name.trim(),
        reps: Number(workoutForm.reps),
        weightKg: workoutForm.weightKg ? Number(workoutForm.weightKg) : null,
        imageUrl: finalImageUrl,
      };

      if (editingWorkout) {
        await workoutsApi.update(editingWorkout.id, payload);
        showToast('Workout updated successfully across all plans');
      } else {
        await workoutsApi.create(payload);
        showToast('New workout created successfully');
      }

      setAddWorkoutModalOpen(false);
      setEditingWorkout(null);
      setSelectedFile(null);
      setWorkoutForm({ categoryId: categories[0]?.id || 1, name: '', reps: 10, weightKg: '', imageUrl: '' });
      setWorkoutFormErrors({});
      loadData();
    } catch (err) {
      console.error('Failed to save workout', err);
      showToast(err.response?.data?.detail || 'Failed to save workout.');
    }
  };

  // US-32: Delete a workout from shared library
  const handleDeleteWorkout = (workout) => {
    setDeleteConfirm({ isOpen: true, workout });
  };

  const confirmDeleteWorkout = async () => {
    if (!deleteConfirm.workout) return;
    try {
      await workoutsApi.delete(deleteConfirm.workout.id);
      showToast('Workout deleted successfully');
      setDeleteConfirm({ isOpen: false, workout: null });
      loadData();
    } catch (err) {
      setDeleteConfirm({ isOpen: false, workout: null });
      if (err.response?.status === 409 || err.response?.data?.error === 'WORKOUT_IN_USE') {
        setAlertModal({
          isOpen: true,
          title: 'Cannot Delete Workout',
          message: 'This workout is used in a plan and cannot be deleted.',
        });
      } else {
        showToast(err.response?.data?.detail || 'Failed to delete workout.');
      }
    }
  };

  // US-33: Add workout to selected day
  const handleAddWorkoutToDay = async () => {
    if (!selectedWorkoutId) return;
    try {
      await workoutsApi.addToPlan(selectedDay, selectedWorkoutId);
      showToast(`Added exercise to ${DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name}`);
      setAddToPlanModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to add exercise to plan', err);
      showToast(err.response?.data?.detail || 'Failed to add exercise to plan.');
    }
  };

  // US-35: Remove workout from day plan
  const handleRemoveEntry = async (entryId) => {
    try {
      await workoutsApi.removeFromPlan(entryId);
      showToast('Exercise removed from routine');
      loadData();
    } catch (err) {
      console.error('Failed to remove exercise', err);
      showToast(err.response?.data?.detail || 'Failed to remove exercise.');
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
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gym Routine & Workout Plans</h1>
            <p className="text-xs text-slate-500">Plan and track your progressive overload routines</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingWorkout(null);
              setSelectedFile(null);
              setWorkoutForm({
                categoryId: categories[0]?.id || 1,
                name: '',
                reps: 10,
                weightKg: '',
                imageUrl: '',
              });
              setWorkoutFormErrors({});
              setAddWorkoutModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Exercise</span>
          </button>
          <button
            onClick={() => setAddToPlanModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 shadow-md shadow-amber-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add to {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name}</span>
          </button>
        </div>
      </div>

      {/* Day Selector Tabs (1=Monday to 7=Sunday) */}
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
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                <span>{day.name}</span>
                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-amber-500'
                    }`}
                  />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 block ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                {count} {count === 1 ? 'exercise' : 'exercises'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Routine for selected day with dynamic category header (US-34) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{currentDayHeaderTitle}</h2>
            <p className="text-xs text-slate-500">
              {currentDayPlan.length} {currentDayPlan.length === 1 ? 'exercise' : 'exercises'} in order
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg">
            Day {selectedDay} of 7
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
            <p className="text-xs">Loading gym routine...</p>
          </div>
        ) : currentDayPlan.length === 0 ? (
          <div className="py-14 text-center">
            <Dumbbell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No workout planned</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click "+ Add to {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name}" to choose an exercise from the library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDayPlan.map((entry, idx) => (
              <div
                key={entry.entryId || idx}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between group hover:border-amber-300 transition-all"
              >
                <div className="flex items-start space-x-3">
                  {entry.imageUrl ? (
                    <img
                      src={entry.imageUrl}
                      alt={entry.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-amber-600 text-xs shrink-0">
                      #{idx + 1}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{entry.name}</h4>
                      {entry.category && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                          {entry.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                      <span>{entry.reps} Reps</span>
                      {entry.weightKg && <span>• {entry.weightKg} kg</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveEntry(entry.entryId)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove from day plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Workouts Library (US-30, US-31, US-32) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Shared Workout Library</h3>
          </div>
          <span className="text-xs text-slate-400">{workoutsLibrary.length} exercises available</span>
        </div>

        {workoutsLibrary.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No workouts in shared library yet. Create your first exercise above!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {workoutsLibrary.map((w) => (
              <div
                key={w.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                      {w.categoryName || 'Exercise'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingWorkout(w);
                          setSelectedFile(null);
                          setWorkoutForm({
                            categoryId: w.categoryId,
                            name: w.name,
                            reps: w.reps,
                            weightKg: w.weightKg || '',
                            imageUrl: w.imageUrl || '',
                          });
                          setWorkoutFormErrors({});
                          setAddWorkoutModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                        title="Edit workout"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkout(w)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete workout"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {w.imageUrl && (
                    <img
                      src={w.imageUrl}
                      alt={w.name}
                      className="w-full h-24 object-cover rounded-lg mt-2 border border-slate-200"
                    />
                  )}
                  <h5 className="font-semibold text-slate-800 text-xs mt-2">{w.name}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {w.reps} reps {w.weightKg ? `• ${w.weightKg} kg` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Workout Dialog (US-29, US-31) */}
      <Modal
        isOpen={addWorkoutModalOpen}
        onClose={() => setAddWorkoutModalOpen(false)}
        title={editingWorkout ? 'Edit Workout' : 'Create New Workout'}
      >
        <form onSubmit={handleSaveWorkout} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={workoutForm.categoryId}
              onChange={(e) => setWorkoutForm({ ...workoutForm, categoryId: e.target.value })}
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
              Workout Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Incline Bench Press"
              value={workoutForm.name}
              onChange={(e) => setWorkoutForm({ ...workoutForm, name: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl ${
                workoutFormErrors.name ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {workoutFormErrors.name && (
              <p className="text-xs text-rose-500 mt-1">{workoutFormErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Reps <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={workoutForm.reps}
                onChange={(e) => setWorkoutForm({ ...workoutForm, reps: e.target.value })}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl ${
                  workoutFormErrors.reps ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {workoutFormErrors.reps && (
                <p className="text-xs text-rose-500 mt-1">{workoutFormErrors.reps}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                placeholder="Optional"
                value={workoutForm.weightKg}
                onChange={(e) => setWorkoutForm({ ...workoutForm, weightKg: e.target.value })}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl ${
                  workoutFormErrors.weightKg ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {workoutFormErrors.weightKg && (
                <p className="text-xs text-rose-500 mt-1">{workoutFormErrors.weightKg}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Exercise Image (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
              {workoutForm.imageUrl && !selectedFile && (
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
              onClick={() => setAddWorkoutModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingImage}
              className="px-4 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center space-x-1.5"
            >
              {uploadingImage && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingWorkout ? 'Update Workout' : 'Save Workout'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Exercise to Day Modal (US-33) */}
      <Modal
        isOpen={addToPlanModalOpen}
        onClose={() => setAddToPlanModalOpen(false)}
        title={`Add Exercise to ${DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Workout Exercise
            </label>
            {workoutsLibrary.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No exercises available. Please create one first.</p>
            ) : (
              <select
                value={selectedWorkoutId}
                onChange={(e) => setSelectedWorkoutId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              >
                {workoutsLibrary.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.categoryName} - {w.reps} reps {w.weightKg ? `• ${w.weightKg}kg` : ''})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddToPlanModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={workoutsLibrary.length === 0}
              onClick={handleAddWorkoutToDay}
              className="px-4 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50"
            >
              Add to Schedule
            </button>
          </div>
        </div>
      </Modal>

      {/* Alert modal for cannot delete (US-32) */}
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
        onClose={() => setDeleteConfirm({ isOpen: false, workout: null })}
        onConfirm={confirmDeleteWorkout}
        title="Delete Workout"
        message={
          deleteConfirm.workout
            ? `Delete "${deleteConfirm.workout.name}" from the shared library?`
            : ''
        }
      />
    </div>
  );
};

export default GymPage;
