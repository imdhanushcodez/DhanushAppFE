import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Star, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

const DEFAULT_GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Thriller',
  'Horror',
  'Sci-Fi',
  'Romance',
  'Animation',
  'Documentary',
  'Other',
];

const MovieModal = ({ isOpen, onClose, onSave, editingMovie, availableGenres = [] }) => {
  const genresList = availableGenres.length > 0 ? availableGenres : DEFAULT_GENRES;

  const [formData, setFormData] = useState({
    title: '',
    genre: genresList[0] || 'Action',
    status: 'WANT_TO_WATCH',
    rating: null,
    review: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingMovie) {
      setFormData({
        title: editingMovie.title || '',
        genre: editingMovie.genre || genresList[0] || 'Action',
        status: editingMovie.status || 'WANT_TO_WATCH',
        rating: editingMovie.rating || null,
        review: editingMovie.review || '',
      });
    } else {
      setFormData({
        title: '',
        genre: genresList[0] || 'Action',
        status: 'WANT_TO_WATCH',
        rating: null,
        review: '',
      });
    }
    setErrors({});
  }, [editingMovie, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRatingClick = (starValue) => {
    setFormData((prev) => ({
      ...prev,
      rating: prev.rating === starValue ? null : starValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Movie title is required';
    if (!formData.genre.trim()) newErrors.genre = 'Genre is required';
    if (!formData.status) newErrors.status = 'Watch status is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      title: formData.title.trim(),
      genre: formData.genre.trim(),
      status: formData.status,
      rating: formData.rating,
      review: formData.review.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMovie ? 'Edit Movie' : 'Add Movie to Watchlist'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Movie Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Inception, Interstellar, The Dark Knight"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
              errors.title
                ? 'border-rose-300 focus:border-rose-500'
                : 'border-slate-200 focus:border-indigo-500'
            }`}
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
        </div>

        {/* Genre & Watch Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Genre */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Genre <span className="text-rose-500">*</span>
            </label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
            >
              {genresList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Watch Status <span className="text-rose-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
            >
              <option value="WANT_TO_WATCH">Want to Watch</option>
              <option value="WATCHING">Watching</option>
              <option value="WATCHED">Watched</option>
            </select>
          </div>
        </div>

        {/* Rating (1 - 5 stars) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            My Rating (Optional)
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
                  title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      formData.rating && star <= formData.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {formData.rating && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, rating: null }))}
                className="text-xs text-slate-400 hover:text-rose-600 underline ml-2 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Review / Personal Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Review / Personal Notes (Optional)
          </label>
          <textarea
            name="review"
            rows="4"
            placeholder="Add your thoughts, review, memorable quotes, or where you watched it..."
            value={formData.review}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            {editingMovie ? 'Update Movie' : 'Save Movie'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MovieModal;
