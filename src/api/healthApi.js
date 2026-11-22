import axiosClient from './axiosClient';

export const healthApi = {
  // Wake free-tier database and check API health
  getHealth: async () => {
    const res = await axiosClient.get('/health');
    return res.data; // { status: "UP" }
  },
};

