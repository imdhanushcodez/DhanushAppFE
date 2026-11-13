import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const NoteModal = ({ isOpen, onClose, onSave, editingNote }) => {
  const [formData, setFormData] = useState({
    topic: '',
    content: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingNote) {
      setFormData({
        topic: editingNote.topic || '',
        content: editingNote.notes || editingNote.content || editingNote.preview || '',
      });
    } else {
      setFormData({ topic: '', content: '' });
    }
    setErrors({});
  }, [editingNote, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.topic.trim()) newErrors.topic = 'Topic is required';
    if (!formData.content.trim()) newErrors.content = 'Note content is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      topic: formData.topic.trim(),
      content: formData.content.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingNote ? 'Edit Note' : 'Add New Note'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Topic / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="topic"
            placeholder="e.g. Project Ideas, Grocery List, Meeting Notes"
            value={formData.topic}
            onChange={handleChange}
            className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
              errors.topic ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
            }`}
          />
          {errors.topic && <p className="text-xs text-rose-500 mt-1">{errors.topic}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Notes <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="content"
            rows="6"
            placeholder="Type your notes here..."
            value={formData.content}
            onChange={handleChange}
            className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
              errors.content ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
            }`}
          />
          {errors.content && <p className="text-xs text-rose-500 mt-1">{errors.content}</p>}
        </div>

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
            {editingNote ? 'Update Note' : 'Save Note'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NoteModal;

