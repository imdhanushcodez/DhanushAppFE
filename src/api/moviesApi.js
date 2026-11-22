import axiosClient from './axiosClient';

export const moviesApi = {
  // List, search, sort, filter movies with pagination
  getAll: async (params = {}) => {
    const res = await axiosClient.get('/movies', { params });
    return res.data; // PageResponse: { items, page, size, totalItems, totalPages }
  },

  // Get one movie
  getById: async (id) => {
    const res = await axiosClient.get(`/movies/${id}`);
    return res.data;
  },

  // Create movie
  create: async (data) => {
    const res = await axiosClient.post('/movies', {
      title: data.title,
      genre: data.genre,
      status: data.status,
      rating: data.rating ? Number(data.rating) : null,
      review: data.review || null,
    });
    return res.data;
  },

  // Update movie
  update: async (id, data) => {
    const res = await axiosClient.put(`/movies/${id}`, {
      title: data.title,
      genre: data.genre,
      status: data.status,
      rating: data.rating ? Number(data.rating) : null,
      review: data.review || null,
    });
    return res.data;
  },

  // Delete movie
  delete: async (id) => {
    const res = await axiosClient.delete(`/movies/${id}`);
    return res.data;
  },

  // Get canonical genre list
  getGenres: async () => {
    const res = await axiosClient.get('/movies/genres');
    return res.data;
  },
};
