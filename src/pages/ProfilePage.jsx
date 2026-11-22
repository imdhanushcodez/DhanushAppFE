import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { uploadApi } from '../api/uploadApi';
import { validateMobile, validatePassword } from '../utils/validators';
import { User, Mail, Phone, Calendar, Lock, Camera, Check, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../components/common/Modal';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    sex: user?.sex || 'PREFER_NOT_TO_SAY',
    date_of_birth: user?.date_of_birth || user?.dateOfBirth || '',
    profile_photo_url: user?.profile_photo_url || user?.profilePhotoUrl || '',
  });

  const [photoPreview, setPhotoPreview] = useState(user?.profile_photo_url || user?.profilePhotoUrl || '');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [pageError, setPageError] = useState('');

  // Change Password state
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');

  // Fetch full profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await authApi.getProfile();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          mobile: data.mobile || '',
          sex: data.sex || 'PREFER_NOT_TO_SAY',
          date_of_birth: data.dateOfBirth || '',
          profile_photo_url: data.profilePhotoUrl || '',
        });
        setPhotoPreview(data.profilePhotoUrl || '');
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (successMsg) setSuccessMsg('');
    if (pageError) setPageError('');
  };

  // US-17: Upload or change profile photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhotoError('Only JPG and PNG images are accepted.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Profile photo size must be less than 2 MB.');
      return;
    }

    setPhotoError('');
    setPhotoUploading(true);

    try {
      const res = await uploadApi.uploadImage(file, 'profile');
      const uploadedUrl = res.url;
      setPhotoPreview(uploadedUrl);
      setFormData((prev) => ({ ...prev, profile_photo_url: uploadedUrl }));
      // Also sync immediately with profile
      await updateProfile({
        ...formData,
        profile_photo_url: uploadedUrl,
      });
      setSuccessMsg('Profile photo updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to upload photo', err);
      setPhotoError(err.response?.data?.detail || 'Failed to upload image to server.');
    } finally {
      setPhotoUploading(false);
    }
  };

  // US-16: Update profile details
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!validateMobile(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be a valid 10-digit number';
    }

    // Date of birth cannot be a future date
    if (formData.date_of_birth) {
      const selectedDate = new Date(formData.date_of_birth);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date_of_birth = 'Date of birth cannot be a future date';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await updateProfile(formData);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update profile', err);
      setPageError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // US-18: Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwdForm.currentPassword) {
      setPwdError('Current password is required.');
      return;
    }
    const val = validatePassword(pwdForm.newPassword);
    if (!val.valid) {
      setPwdError(val.message);
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('New password and confirmation do not match.');
      return;
    }

    setPwdLoading(true);
    setPwdError('');
    try {
      await authApi.changePassword(pwdForm.currentPassword, pwdForm.newPassword);
      setPwdModalOpen(false);
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMsg('Password changed successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to change password', err);
      setPwdError(err.response?.data?.detail || err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account & Profile</h1>
        <p className="text-xs text-slate-500">Manage your credentials, personal details and security</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {pageError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs font-semibold text-rose-800 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{pageError}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Cover & Avatar Header */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 relative">
          <div className="absolute -bottom-10 left-6 sm:left-8 flex items-end space-x-4">
            <div className="relative group">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-2xl ring-4 ring-white shadow-md">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                </div>
              )}
              <label
                htmlFor="photo-upload"
                className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Photo"
              >
                {photoUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/png, image/jpeg"
                disabled={photoUploading}
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="pt-14 px-6 sm:px-8 pb-8 space-y-6">
          {photoError && <p className="text-xs text-rose-500">{photoError}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Email (Read-only as per US-15 & US-16) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Email Address
                  </label>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Fixed / Read-only</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              {/* Mobile Number (Editable) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="mobile"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 ${
                      errors.mobile ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.mobile && <p className="text-xs text-rose-500 mt-1">{errors.mobile}</p>}
              </div>

              {/* Sex list (MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sex
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 cursor-pointer"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    name="date_of_birth"
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>
                {errors.date_of_birth && <p className="text-xs text-rose-500 mt-1">{errors.date_of_birth}</p>}
              </div>

              {/* Account Password section (shown only as dots) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Account Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPwdError('');
                      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPwdModalOpen(true);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Change Password
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value="••••••••••••"
                    disabled
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono tracking-widest"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors flex items-center space-x-1.5"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Modal (US-18) */}
      <Modal isOpen={pwdModalOpen} onClose={() => setPwdModalOpen(false)} title="Change Account Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          {pwdError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pwdError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={pwdForm.currentPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Min 8 chars, 1 letter & 1 number"
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={pwdForm.confirmPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPwdModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center space-x-1.5"
            >
              {pwdLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
