import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-6xl font-black text-indigo-600 dark:text-indigo-400">404</span>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">Page Not Found</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 btn-shine text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;

