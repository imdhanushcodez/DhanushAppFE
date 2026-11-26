import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { validateEmail } from '../utils/validators';
import { KeyRound, Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
    } catch {
      // Ignore error to prevent user enumeration
    } finally {
      setLoading(false);
      // US-03: The same message is shown whether or not the email exists
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-indigo-600 btn-shine text-white shadow-lg shadow-indigo-500/30 mb-4">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Forgot Password</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          We'll send a password reset link to your registered email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-6 shadow-xl rounded-3xl border border-slate-900/10 dark:border-white/10 sm:px-10">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-500/15 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Check your inbox</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                If this email is registered, a password reset link has been sent. It is valid for 15 minutes.
              </p>
              <div className="pt-4 border-t border-slate-900/10 dark:border-white/10">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="dhanush@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
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
                    <Send className="w-4 h-4" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

