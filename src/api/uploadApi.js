import axiosClient from './axiosClient';

export const uploadApi = {
  // US-17, US-29, US-37: Upload image (folder = 'profile' | 'workout' | 'food')
  uploadImage: async (file, folder = 'profile') => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosClient.post(`/uploads/image?folder=${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data; // { url: "..." }
  },
};

