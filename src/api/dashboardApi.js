import axiosClient from './axiosClient';

export const dashboardApi = {
  // US-06, US-36, US-44: Get today's workout and meals (day: 1 = Monday to 7 = Sunday)
  getDashboard: async (day) => {
    const res = await axiosClient.get(`/dashboard?day=${day}`);
    return res.data; // { day, workout: { day, categories, entries }, meals: { day, totalCalories, totalProtein, entries } }
  },
};

