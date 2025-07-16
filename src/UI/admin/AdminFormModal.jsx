import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
// Removed: import { get } from '../../utils/api';

export default function AdminFormModal({ open, onClose, onSubmit, initialData, isEdit }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: '',
    is_active: true,
  });
  // Removed roles state and fetchRoles logic
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        password: '',
        password_confirmation: '',
        role: initialData?.role || '',
        is_active: initialData?.is_active ?? true,
      });
    }
    // eslint-disable-next-line
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      toast.success(isEdit ? 'Admin updated!' : 'Admin created!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  // Focus management: focus the first input when modal opens
  useEffect(() => {
    if (open) {
      const firstInput = document.querySelector('.admin-modal input, .admin-modal select');
      if (firstInput) firstInput.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" role="dialog" aria-modal="true">
      <div className="admin-modal bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button onClick={onClose} aria-label="Close modal" className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        <h3 className="text-xl font-bold mb-6" id="admin-modal-title">{isEdit ? 'Edit Admin' : 'Add New Admin'}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-labelledby="admin-modal-title">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
          </div>
          {!isEdit && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
            </div>
          )}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
          </div>
          {!isEdit && (
            <>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium mb-1">Confirm Password</label>
                <input id="password_confirmation" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
              </div>
            </>
          )}
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400">
              <option value="">Select role</option>
              <option value="it_support">it_support</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} />
            <label htmlFor="is_active" className="text-sm">Active</label>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 font-bold text-white rounded bg-blue-500 hover:bg-blue-600 transition disabled:opacity-60 mt-2">
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Admin')}
          </button>
        </form>
      </div>
    </div>
  );
} 