import axiosClient from './axiosClient';

export const authApi = {
  // US-01: Sign up (email, password, mobile)
  signup: async (data) => {
    const res = await axiosClient.post('/auth/signup', {
      email: data.email,
      password: data.password,
      mobile: data.mobile,
    });
    return res.data;
  },

  // US-02: Log in (email, password) - sets HttpOnly cookie access_token
  login: async (data) => {
    const res = await axiosClient.post('/auth/login', {
      email: data.email,
      password: data.password,
    });
    return res.data;
  },

  // US-02: Log out - clears HttpOnly cookie
  logout: async () => {
    const res = await axiosClient.post('/auth/logout');
    return res.data;
  },

  // US-02: Get current logged-in user from session
  getMe: async () => {
    const res = await axiosClient.get('/auth/me');
    return res.data;
  },

  // US-03: Forgot password (send reset link by email)
  forgotPassword: async (email) => {
    const res = await axiosClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  // US-04: Reset password with token
  resetPassword: async (token, newPassword) => {
    const res = await axiosClient.post('/auth/reset-password', { token, newPassword });
    return res.data;
  },

  // US-05: Get profile details (includes dateOfBirth, sex, profilePhotoUrl)
  getProfile: async () => {
    const res = await axiosClient.get('/profile');
    return res.data;
  },

  // US-15, US-16, US-17: Update profile (mobile required; name, sex, dateOfBirth, profilePhotoUrl optional)
  updateProfile: async (data) => {
    const res = await axiosClient.put('/profile', {
      mobile: data.mobile,
      name: data.name || null,
      sex: data.sex || null,
      dateOfBirth: data.dateOfBirth || data.date_of_birth || null,
      profilePhotoUrl: data.profilePhotoUrl || data.profile_photo_url || null,
    });
    return res.data;
  },

  // US-18: Change password
  changePassword: async (currentPassword, newPassword) => {
    const res = await axiosClient.put('/profile/password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};
