import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  KeyRound,
  FileText,
  Clapperboard,
  Dumbbell,
  Utensils,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vault', path: '/vault', icon: KeyRound },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Movies', path: '/movies', icon: Clapperboard },
    { name: 'Gym', path: '/gym', icon: Dumbbell },
    { name: 'Diet', path: '/diet', icon: Utensils },
  ];

  return (
    <div className="sticky top-3 z-40 px-3 sm:px-6 lg:px-8 pt-3">
    <nav className="glass-nav max-w-7xl mx-auto rounded-[28px]">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                DhanushApp
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-8 space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-white/70 dark:bg-white/15 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm ring-1 ring-white/60 dark:ring-white/10'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-900/10 dark:hover:bg-white/15'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* User Profile and Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle */}
            <div
              className="flex items-center rounded-full bg-slate-900/5 dark:bg-white/10 p-0.5"
              role="group"
              aria-label="Theme"
            >
              {[
                { key: 'light', Icon: Sun, label: 'Light' },
                { key: 'system', Icon: Monitor, label: 'System' },
                { key: 'dark', Icon: Moon, label: 'Dark' },
              ].map(({ key, Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTheme(key)}
                  aria-label={`${label} theme`}
                  aria-pressed={theme === key}
                  title={`${label} theme`}
                  className={`p-1.5 rounded-full transition-all ${
                    theme === key
                      ? 'bg-white/80 dark:bg-white/20 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 rounded-full hover:bg-slate-900/10 dark:hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                aria-label="User menu"
              >
                {user?.profile_photo_url ? (
                  <img
                    src={user.profile_photo_url}
                    alt={user.name || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center font-semibold text-xs ring-2 ring-slate-900/10 dark:ring-white/15">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                )}
                <span className="hidden sm:inline-block text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:inline-block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-strong py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-900/10 dark:border-white/10">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center space-x-2 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:hover:bg-white/15 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-900/10 dark:border-white/10 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-sm font-medium ${
                    isActive ? 'bg-white/70 dark:bg-white/15 text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:hover:bg-white/15'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </nav>
    </div>
  );
};

export default Navbar;

