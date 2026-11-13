import axiosClient from './axiosClient';

export const notesApi = {
  // US-11, US-22, US-23, US-24: Get notes with search, sort, filter, pagination
  getAll: async (params = {}) => {
    const res = await axiosClient.get('/notes', { params });
    return res.data; // PageResponse: { items, page, size, totalItems, totalPages }
  },

  // US-13: Get one note with full content
  getById: async (id) => {
    const res = await axiosClient.get(`/notes/${id}`);
    return res.data;
  },

  // US-12: Add note (topic, notes)
  create: async (data) => {
    const res = await axiosClient.post('/notes', {
      topic: data.topic,
      notes: data.notes || data.content,
    });
    return res.data;
  },

  // US-13: Update note
  update: async (id, data) => {
    const res = await axiosClient.put(`/notes/${id}`, {
      topic: data.topic,
      notes: data.notes || data.content,
    });
    return res.data;
  },

  // US-14: Delete note
  delete: async (id) => {
    const res = await axiosClient.delete(`/notes/${id}`);
    return res.data;
  },

  // US-27: Export all notes as CSV
  exportCsv: async () => {
    const res = await axiosClient.get('/notes/export', {
      responseType: 'blob',
    });
    return res.data;
  },

  // US-28: Download sample import CSV template
  getTemplate: async () => {
    const res = await axiosClient.get('/notes/import/template', {
      responseType: 'blob',
    });
    return res.data;
  },

  // US-28: Preview or import CSV
  importCsv: async (file, dryRun = false) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosClient.post(`/notes/import?dryRun=${dryRun}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data; // dryRun ? ImportPreviewResponse : ImportResultResponse
  },
};
