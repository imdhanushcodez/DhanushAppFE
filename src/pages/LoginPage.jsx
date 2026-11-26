import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { healthApi } from '../api/healthApi';
import { KeyRound, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMsg = location.state?.successMessage;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Wake the free-tier backend & database while user types
  useEffect(() => {
    healthApi.getHealth().catch(() => { });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    const res = await login(formData.email, formData.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      // US-02: general message shown without saying which is wrong
      setError(res.message || 'Email or password is incorrect');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-indigo-600 btn-shine text-white shadow-lg shadow-indigo-500/30 mb-4">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">DhanushApp</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Sign in to your personal vault, notes, gym and diet tracker
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-6 shadow-xl rounded-3xl border border-slate-900/10 dark:border-white/10 sm:px-10">
          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/25 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 dark:bg-rose-400/10 border border-rose-500/25 rounded-xl flex items-center space-x-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="dhanush@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white/40 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white/40 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 btn-shine hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

