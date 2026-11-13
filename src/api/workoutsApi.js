import axiosClient from './axiosClient';

export const workoutsApi = {
  // US-29: Get workout categories
  getCategories: async () => {
    const res = await axiosClient.get('/workout-categories');
    return res.data; // [{ id, name }]
  },

  // US-30: Get shared workouts library (optional filter by categoryId)
  getAll: async (categoryId) => {
    const params = categoryId ? { categoryId } : {};
    const res = await axiosClient.get('/workouts', { params });
    return res.data; // List<WorkoutResponse>
  },

  // US-31: Get one workout
  getById: async (id) => {
    const res = await axiosClient.get(`/workouts/${id}`);
    return res.data;
  },

  // US-29: Add a workout to the shared library
  create: async (data) => {
    const res = await axiosClient.post('/workouts', {
      categoryId: Number(data.categoryId || data.category_id),
      name: data.name,
      reps: Number(data.reps),
      weightKg: data.weightKg || data.weight_kg ? Number(data.weightKg || data.weight_kg) : null,
      imageUrl: data.imageUrl || data.image_url || null,
    });
    return res.data;
  },

  // US-31: Update workout
  update: async (id, data) => {
    const res = await axiosClient.put(`/workouts/${id}`, {
      categoryId: Number(data.categoryId || data.category_id),
      name: data.name,
      reps: Number(data.reps),
      weightKg: data.weightKg || data.weight_kg ? Number(data.weightKg || data.weight_kg) : null,
      imageUrl: data.imageUrl || data.image_url || null,
    });
    return res.data;
  },

  // US-32: Delete workout from library
  delete: async (id) => {
    const res = await axiosClient.delete(`/workouts/${id}`);
    return res.data;
  },

  // US-34: Get weekly workout plan
  getPlan: async () => {
    const res = await axiosClient.get('/plans/workouts');
    return res.data; // { days: [{ day, categories, entries }] }
  },

  // US-33: Add workout to a day (day: 1..7, workoutId)
  addToPlan: async (day, workoutId) => {
    const res = await axiosClient.post('/plans/workouts', {
      day: Number(day),
      workoutId: Number(workoutId),
    });
    return res.data;
  },

  // US-35: Remove workout from day plan
  removeFromPlan: async (entryId) => {
    const res = await axiosClient.delete(`/plans/workouts/${entryId}`);
    return res.data;
  },
};
