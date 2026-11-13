import axiosClient from './axiosClient';

export const vaultApi = {
  // US-07, US-19, US-20, US-21: Get saved passwords with filters and pagination
  getAll: async (params = {}) => {
    const res = await axiosClient.get('/vault', { params });
    return res.data; // PageResponse: { items, page, size, totalItems, totalPages }
  },

  // US-21: Distinct source names for filtering
  getSources: async () => {
    const res = await axiosClient.get('/vault/sources');
    return res.data;
  },

  // US-08: Add password (source, loginId, password)
  create: async (data) => {
    const res = await axiosClient.post('/vault', {
      source: data.source,
      loginId: data.loginId || data.login_id,
      password: data.password,
    });
    return res.data;
  },

  // US-09: Get full entry with decrypted password
  getById: async (id) => {
    const res = await axiosClient.get(`/vault/${id}`);
    return res.data;
  },

  // US-09: Reveal password
  getPassword: async (id) => {
    const res = await axiosClient.get(`/vault/${id}/password`);
    return res.data; // { password: "..." }
  },

  // US-09: Update password entry
  update: async (id, data) => {
    const res = await axiosClient.put(`/vault/${id}`, {
      source: data.source,
      loginId: data.loginId || data.login_id,
      password: data.password,
    });
    return res.data;
  },

  // US-10: Delete password entry
  delete: async (id) => {
    const res = await axiosClient.delete(`/vault/${id}`);
    return res.data;
  },

  // US-26: Export passwords as CSV (verifies account password first)
  exportCsv: async (currentPassword) => {
    const res = await axiosClient.post(
      '/vault/export',
      { currentPassword },
      { responseType: 'blob' }
    );
    return res.data;
  },

  // US-25: Download sample import CSV template
  getTemplate: async () => {
    const res = await axiosClient.get('/vault/import/template', {
      responseType: 'blob',
    });
    return res.data;
  },

  // US-25: Preview or import CSV
  importCsv: async (file, dryRun = false) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosClient.post(`/vault/import?dryRun=${dryRun}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data; // dryRun ? ImportPreviewResponse : ImportResultResponse
  },
};
