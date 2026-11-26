import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TodayWorkoutWidget from '../components/dashboard/TodayWorkoutWidget';
import TodayDietWidget from '../components/dashboard/TodayDietWidget';
import VaultCard from '../components/vault/VaultCard';
import NoteCard from '../components/notes/NoteCard';
import MovieCard from '../components/movies/MovieCard';
import VaultModal from '../components/vault/VaultModal';
import NoteModal from '../components/notes/NoteModal';
import MovieModal from '../components/movies/MovieModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { dashboardApi } from '../api/dashboardApi';
import { vaultApi } from '../api/vaultApi';
import { notesApi } from '../api/notesApi';
import { moviesApi } from '../api/moviesApi';
import { getTodayDayOfWeek } from '../utils/dateFormatter';
import { KeyRound, FileText, Clapperboard, Plus, ArrowRight } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  // State for data
  const [vaultEntries, setVaultEntries] = useState([]);
  const [notes, setNotes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [todayWorkouts, setTodayWorkouts] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [editingVault, setEditingVault] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  // Delete confirm dialog
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: null,
    item: null,
    title: '',
    message: '',
  });

  const loadDashboardData = async () => {
    try {
      const todayDay = getTodayDayOfWeek();
      const [dashRes, vaultRes, notesRes, moviesRes] = await Promise.allSettled([
        dashboardApi.getDashboard(todayDay),
        vaultApi.getAll({ size: 4 }),
        notesApi.getAll({ size: 4 }),
        moviesApi.getAll({ size: 3 }),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setTodayWorkouts(dashRes.value.workout?.entries || []);
        setTodayMeals(dashRes.value.meals?.entries || []);
      }

      if (vaultRes.status === 'fulfilled' && vaultRes.value) {
        const items = vaultRes.value.items || vaultRes.value || [];
        setVaultEntries(items);
      }

      if (notesRes.status === 'fulfilled' && notesRes.value) {
        const items = notesRes.value.items || notesRes.value || [];
        setNotes(items);
      }

      if (moviesRes.status === 'fulfilled' && moviesRes.value) {
        const items = moviesRes.value.items || moviesRes.value || [];
        setMovies(items);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Vault handlers
  const handleSaveVault = async (data) => {
    try {
      if (editingVault) {
        await vaultApi.update(editingVault.id, data);
      } else {
        await vaultApi.create(data);
      }
      setVaultModalOpen(false);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to save vault entry', err);
    }
  };

  const handleDeleteVaultClick = (entry) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'vault',
      item: entry,
      title: 'Delete Password',
      message: `Delete the password for ${entry.source}? This cannot be undone.`,
    });
  };

  // Notes handlers
  const handleSaveNote = async (data) => {
    try {
      if (editingNote) {
        await notesApi.update(editingNote.id, data);
      } else {
        await notesApi.create(data);
      }
      setNoteModalOpen(false);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to save note', err);
    }
  };

  const handleDeleteNoteClick = (note) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'note',
      item: note,
      title: 'Delete Note',
      message: `Delete the note "${note.topic}"? This cannot be undone.`,
    });
  };

  // Movie handlers
  const handleSaveMovie = async (data) => {
    try {
      if (editingMovie) {
        await moviesApi.update(editingMovie.id, data);
      } else {
        await moviesApi.create(data);
      }
      setMovieModalOpen(false);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to save movie', err);
    }
  };

  const handleDeleteMovieClick = (movie) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'movie',
      item: movie,
      title: 'Delete Movie',
      message: `Delete "${movie.title}" from your watchlist? This cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteConfirm.type === 'vault') {
        await vaultApi.delete(deleteConfirm.item.id);
      } else if (deleteConfirm.type === 'note') {
        await notesApi.delete(deleteConfirm.item.id);
      } else if (deleteConfirm.type === 'movie') {
        await moviesApi.delete(deleteConfirm.item.id);
      }
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      loadDashboardData();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            Personal Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Dhanush'}!
          </h1>
          <p className="mt-1 text-sm text-indigo-100 max-w-xl">
            Here is your daily snapshot: today's workout, meals, recently saved passwords, and notes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingVault(null);
              setVaultModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 glass text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl shadow-xs hover:bg-indigo-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Password</span>
          </button>
          <button
            onClick={() => {
              setEditingNote(null);
              setNoteModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-500/50 hover:bg-indigo-500/70 border border-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>
          <button
            onClick={() => {
              setEditingMovie(null);
              setMovieModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-500/50 hover:bg-indigo-500/70 border border-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Movie</span>
          </button>
        </div>
      </div>

      {/* Routine & Diet Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TodayWorkoutWidget workouts={todayWorkouts} />
        <TodayDietWidget meals={todayMeals} />
      </div>

      {/* Passwords Section (US-06) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Passwords Vault</h2>
          </div>
          <Link
            to="/vault"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>Open Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {vaultEntries.length === 0 ? (
          <div className="p-8 text-center glass rounded-3xl border border-dashed border-slate-900/10 dark:border-white/10">
            <p className="text-sm text-slate-500 dark:text-slate-400">No passwords saved yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vaultEntries.slice(0, 3).map((entry) => (
              <VaultCard
                key={entry.id}
                entry={{
                  ...entry,
                  login_id: entry.loginId || entry.login_id,
                }}
                onEdit={(e) => {
                  setEditingVault(e);
                  setVaultModalOpen(true);
                }}
                onDelete={handleDeleteVaultClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Notes Section (US-06) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Personal Notes</h2>
          </div>
          <Link
            to="/notes"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>Open Notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {notes.length === 0 ? (
          <div className="p-8 text-center glass rounded-3xl border border-dashed border-slate-900/10 dark:border-white/10">
            <p className="text-sm text-slate-500 dark:text-slate-400">No notes yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.slice(0, 3).map((note) => (
              <NoteCard
                key={note.id}
                note={{
                  ...note,
                  content: note.preview || note.content || note.notes,
                }}
                onEdit={(n) => {
                  setEditingNote(n);
                  setNoteModalOpen(true);
                }}
                onDelete={handleDeleteNoteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Movies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Clapperboard className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Movie Watchlist & Log</h2>
          </div>
          <Link
            to="/movies"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>Open Movies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {movies.length === 0 ? (
          <div className="p-8 text-center glass rounded-3xl border border-dashed border-slate-900/10 dark:border-white/10">
            <p className="text-sm text-slate-500 dark:text-slate-400">No movies in your watchlist yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {movies.slice(0, 3).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onEdit={(m) => {
                  setEditingMovie(m);
                  setMovieModalOpen(true);
                }}
                onDelete={handleDeleteMovieClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <VaultModal
        isOpen={vaultModalOpen}
        onClose={() => setVaultModalOpen(false)}
        onSave={handleSaveVault}
        editingEntry={editingVault}
      />

      <NoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSave={handleSaveNote}
        editingNote={editingNote}
      />

      <MovieModal
        isOpen={movieModalOpen}
        onClose={() => setMovieModalOpen(false)}
        onSave={handleSaveMovie}
        editingMovie={editingMovie}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
      />
    </div>
  );
};

export default DashboardPage;
