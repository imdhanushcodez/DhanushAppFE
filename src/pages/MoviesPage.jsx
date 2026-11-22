import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MovieCard from '../components/movies/MovieCard';
import MovieModal from '../components/movies/MovieModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SearchBar from '../components/common/SearchBar';
import SortDropdown from '../components/common/SortDropdown';
import FilterChips from '../components/common/FilterChips';
import { moviesApi } from '../api/moviesApi';
import { Clapperboard, Plus, Loader2 } from 'lucide-react';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genreFilter, setGenreFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState('newest');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, movie: null });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Load canonical genres once
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const list = await moviesApi.getGenres();
        if (Array.isArray(list)) {
          setGenres(list);
        }
      } catch (err) {
        console.error('Failed to load genres', err);
      }
    };
    fetchGenres();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      if (genreFilter !== 'ALL') {
        params.genre = genreFilter;
      }

      if (ratingFilter !== 'ALL') {
        if (ratingFilter === '5') params.minRating = 5;
        else if (ratingFilter === '4') params.minRating = 4;
        else if (ratingFilter === '3') params.minRating = 3;
      }

      // Map sortOption
      if (sortOption === 'oldest') params.sort = 'oldest';
      else if (sortOption === 'title_asc') params.sort = 'titleAsc';
      else if (sortOption === 'title_desc') params.sort = 'titleDesc';
      else if (sortOption === 'rating_desc') params.sort = 'ratingDesc';
      else if (sortOption === 'updated') params.sort = 'updated';
      else params.sort = 'newest';

      if (dateFilter !== 'ALL') {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        params.addedTo = todayStr;
        if (dateFilter === 'today') {
          params.addedFrom = todayStr;
        } else if (dateFilter === '7days') {
          const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          params.addedFrom = d.toISOString().split('T')[0];
        } else if (dateFilter === '30days') {
          const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          params.addedFrom = d.toISOString().split('T')[0];
        }
      }

      const res = await moviesApi.getAll(params);
      const items = Array.isArray(res) ? res : res.items || [];
      setMovies(items);
    } catch (err) {
      console.error('Failed to load movies', err);
      showToast(err.response?.data?.detail || 'Failed to load movies from server.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, genreFilter, ratingFilter, sortOption, dateFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timeout);
  }, [loadData]);

  // Active filter chips
  const activeFilters = useMemo(() => {
    const list = [];
    if (statusFilter !== 'ALL') {
      const labels = {
        WANT_TO_WATCH: 'Want to Watch',
        WATCHING: 'Watching',
        WATCHED: 'Watched',
      };
      list.push({ id: 'status', label: 'Status', value: labels[statusFilter] || statusFilter });
    }
    if (genreFilter !== 'ALL') {
      list.push({ id: 'genre', label: 'Genre', value: genreFilter });
    }
    if (ratingFilter !== 'ALL') {
      const labels = { '5': '5 Stars', '4': '4+ Stars', '3': '3+ Stars' };
      list.push({ id: 'rating', label: 'Rating', value: labels[ratingFilter] || ratingFilter });
    }
    if (dateFilter !== 'ALL') {
      const labels = { today: 'Today', '7days': 'Last 7 days', '30days': 'Last 30 days' };
      list.push({ id: 'date', label: 'Date', value: labels[dateFilter] || dateFilter });
    }
    return list;
  }, [statusFilter, genreFilter, ratingFilter, dateFilter]);

  const handleRemoveFilter = (filterId) => {
    if (filterId === 'status') setStatusFilter('ALL');
    if (filterId === 'genre') setGenreFilter('ALL');
    if (filterId === 'rating') setRatingFilter('ALL');
    if (filterId === 'date') setDateFilter('ALL');
  };

  const handleClearAllFilters = () => {
    setStatusFilter('ALL');
    setGenreFilter('ALL');
    setRatingFilter('ALL');
    setDateFilter('ALL');
    setSearchQuery('');
  };

  // Handlers
  const handleEditClick = async (movie) => {
    try {
      const full = await moviesApi.getById(movie.id);
      setEditingMovie(full);
    } catch {
      setEditingMovie(movie);
    }
    setModalOpen(true);
  };

  const handleSaveMovie = async (data) => {
    try {
      if (editingMovie) {
        await moviesApi.update(editingMovie.id, data);
        showToast('Movie updated successfully');
      } else {
        await moviesApi.create(data);
        showToast('Movie added to your watchlist successfully');
      }
      setEditingMovie(null);
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to save movie', err);
      const detail = err.response?.data?.detail || err.response?.data?.message || 'Failed to save movie.';
      showToast(detail);
    }
  };

  const handleDeleteClick = (movie) => {
    setDeleteConfirm({ isOpen: true, movie });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.movie) return;
    try {
      await moviesApi.delete(deleteConfirm.movie.id);
      showToast('Movie deleted successfully');
      setDeleteConfirm({ isOpen: false, movie: null });
      loadData();
    } catch (err) {
      console.error('Failed to delete movie', err);
      showToast(err.response?.data?.detail || 'Failed to delete movie.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Movie Watchlist & Log</h1>
            <p className="text-xs text-slate-500">Track movies to watch and log what you've seen with personal reviews & ratings</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingMovie(null);
              setModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Movie</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search movies by title or review..."
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="WANT_TO_WATCH">Want to Watch</option>
              <option value="WATCHING">Watching</option>
              <option value="WATCHED">Watched</option>
            </select>

            {/* Genre Filter */}
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="ALL">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="ALL">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
            </select>

            <SortDropdown
              value={sortOption}
              onChange={setSortOption}
              options={[
                { value: 'newest', label: 'Newest first' },
                { value: 'oldest', label: 'Oldest first' },
                { value: 'title_asc', label: 'Title A to Z' },
                { value: 'title_desc', label: 'Title Z to A' },
                { value: 'rating_desc', label: 'Rating: High to Low' },
                { value: 'updated', label: 'Recently updated' },
              ]}
            />
          </div>
        </div>

        <FilterChips
          filters={activeFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
          <p className="text-xs">Loading movies...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <Clapperboard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No movies found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || activeFilters.length > 0
              ? 'Try adjusting your search query or filters.'
              : 'Click "+ Add Movie" to add a film to your watchlist or log.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <MovieModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingMovie(null);
        }}
        onSave={handleSaveMovie}
        editingMovie={editingMovie}
        availableGenres={genres}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, movie: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Movie"
        message={
          deleteConfirm.movie
            ? `Delete "${deleteConfirm.movie.title}" from your list? This cannot be undone.`
            : ''
        }
      />
    </div>
  );
};

export default MoviesPage;
