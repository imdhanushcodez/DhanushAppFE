import axiosClient from './axiosClient';

export const mealsApi = {
  // US-37: Get food categories
  getCategories: async () => {
    const res = await axiosClient.get('/food-categories');
    return res.data; // [{ id, name }]
  },

  // US-38: Get shared food library
  getAll: async (categoryId) => {
    const params = categoryId ? { categoryId } : {};
    const res = await axiosClient.get('/foods', { params });
    return res.data; // List<FoodResponse>
  },

  // US-39: Get one food
  getById: async (id) => {
    const res = await axiosClient.get(`/foods/${id}`);
    return res.data;
  },

  // US-37: Add food to shared library
  create: async (data) => {
    const res = await axiosClient.post('/foods', {
      categoryId: Number(data.categoryId || data.category_id || data.category?.id),
      dishName: data.dishName || data.dish_name,
      weightG: Number(data.weightG || data.weight_g),
      calories: Number(data.calories),
      proteinG: Number(data.proteinG || data.protein_g || 0),
      fiberG: Number(data.fiberG || data.fiber_g || 0),
      imageUrl: data.imageUrl || data.image_url || null,
      others: data.others || null,
    });
    return res.data;
  },

  // US-39: Update food
  update: async (id, data) => {
    const res = await axiosClient.put(`/foods/${id}`, {
      categoryId: Number(data.categoryId || data.category_id || data.category?.id),
      dishName: data.dishName || data.dish_name,
      weightG: Number(data.weightG || data.weight_g),
      calories: Number(data.calories),
      proteinG: Number(data.proteinG || data.protein_g || 0),
      fiberG: Number(data.fiberG || data.fiber_g || 0),
      imageUrl: data.imageUrl || data.image_url || null,
      others: data.others || null,
    });
    return res.data;
  },

  // US-40: Delete food
  delete: async (id) => {
    const res = await axiosClient.delete(`/foods/${id}`);
    return res.data;
  },

  // US-42: Get weekly diet plan with day totals
  getPlan: async () => {
    const res = await axiosClient.get('/plans/foods');
    return res.data; // { days: [{ day, totalCalories, totalProtein, entries }] }
  },

  // US-41: Add food to a day (day: 1..7, foodId)
  addToPlan: async (day, foodId) => {
    const res = await axiosClient.post('/plans/foods', {
      day: Number(day),
      foodId: Number(foodId),
    });
    return res.data;
  },

  // US-43: Remove food from day plan
  removeFromPlan: async (entryId) => {
    const res = await axiosClient.delete(`/plans/foods/${entryId}`);
    return res.data;
  },
};
