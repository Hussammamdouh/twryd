import React, { useEffect, useState } from 'react';
import { useToast } from '../Common/ToastContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^01[0-9]{9}$|^\+?[0-9]{10,15}$/;

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
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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
      setFormErrors({});
    }
    // eslint-disable-next-line
  }, [open, initialData]);

  function validateField(name, value) {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required.';
        return '';
      case 'email':
        if (!isEdit && !value) return 'Email is required.';
        if (value && !EMAIL_REGEX.test(value)) return 'Invalid email format.';
        return '';
      case 'phone':
        if (!value) return 'Phone is required.';
        if (!PHONE_REGEX.test(value)) return 'Invalid phone number.';
        return '';
      case 'password':
        if (!isEdit && !value) return 'Password is required.';
        if (value && value.length < 6) return 'Password must be at least 6 characters.';
        return '';
      case 'password_confirmation':
        if (!isEdit && !value) return 'Please confirm password.';
        if (value !== form.password) return 'Passwords do not match.';
        return '';
      case 'role':
        if (!value) return 'Role is required.';
        return '';
      default:
        return '';
    }
  }

  function validateAll() {
    const errors = {};
    errors.name = validateField('name', form.name);
    errors.email = validateField('email', form.email);
    errors.phone = validateField('phone', form.phone);
    errors.password = validateField('password', form.password);
    errors.password_confirmation = validateField('password_confirmation', form.password_confirmation);
    errors.role = validateField('role', form.role);
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, type === 'checkbox' ? checked : value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.show('Please fix the errors in the form.', 'error');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(form);
      toast.show(isEdit ? 'Admin updated!' : 'Admin created!', 'success');
      onClose();
    } catch (err) {
      toast.show(err.message || 'Failed to submit', 'error');
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-labelledby="admin-modal-title" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" aria-invalid={!!formErrors.name} aria-describedby={formErrors.name ? 'name-error' : undefined} />
            {formErrors.name && <div id="name-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.name}</div>}
          </div>
          {!isEdit && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" aria-invalid={!!formErrors.email} aria-describedby={formErrors.email ? 'email-error' : undefined} />
              {formErrors.email && <div id="email-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.email}</div>}
            </div>
          )}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" aria-invalid={!!formErrors.phone} aria-describedby={formErrors.phone ? 'phone-error' : undefined} />
            {formErrors.phone && <div id="phone-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.phone}</div>}
          </div>
          {!isEdit && (
            <>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" aria-invalid={!!formErrors.password} aria-describedby={formErrors.password ? 'password-error' : undefined} />
                {formErrors.password && <div id="password-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.password}</div>}
              </div>
              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium mb-1">Confirm Password</label>
                <input id="password_confirmation" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" aria-invalid={!!formErrors.password_confirmation} aria-describedby={formErrors.password_confirmation ? 'password_confirmation-error' : undefined} />
                {formErrors.password_confirmation && <div id="password_confirmation-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.password_confirmation}</div>}
              </div>
            </>
          )}
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" aria-invalid={!!formErrors.role} aria-describedby={formErrors.role ? 'role-error' : undefined}>
              <option value="">Select role</option>
              <option value="it_support">it_support</option>
              <option value="admin">admin</option>
            </select>
            {formErrors.role && <div id="role-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.role}</div>}
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