import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '../Common/ToastContext';
import Modal from '../Common/Modal';
import Spinner from '../supplier/Spinner';
import { createFormChangeHandler } from '../../utils/formUtils';
import { useFormFocus } from '../../hooks/useFormFocus';
import { useLanguage } from '../../contexts/LanguageContext';
import { get } from '../../utils/api';

// Security: Enhanced validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^01[0-9]{9}$|^\+?[0-9]{10,15}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

const KEY_PERSON_ROLES = [
  { value: '', label: 'Select Role' },
  { value: 'Management', label: 'Management' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Owner', label: 'Owner' },
];

export default function SupplierFormModal({ open, onClose, onSubmit, initialData, isEdit }) {
  const [form, setForm] = useState({
    name: '',
    name_ar: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    password_confirmation: '',
    tax_card_number: '',
    cr_number: '',
    category_id: '',
    latitude: '',
    longitude: '',
    key_persons: [
      { name: '', role: '', phone: '', email: '' },
      { name: '', role: '', phone: '', email: '' },
    ],
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({
    key_persons: [
      { name: '', role: '', phone: '', email: '' },
      { name: '', role: '', phone: '', email: '' },
    ]
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const toast = useToast();
  const formRef = useRef();
  const { handleInputFocus } = useFormFocus();
  const { t } = useLanguage();

  // Create memoized change handler
  const handleChange = useCallback(
    createFormChangeHandler(setForm, setFormErrors),
    []
  );

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true);
      try {
        const res = await get('/api/v1/categories');
        const cats = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCategories(cats);
      } catch (err) {
        toast.show(err.message || 'Failed to load categories', 'error');
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, [toast]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || '',
        name_ar: initialData?.name_ar || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        whatsapp: initialData?.whatsapp || '',
        password: '',
        password_confirmation: '',
        tax_card_number: initialData?.tax_card_number || '',
        cr_number: initialData?.cr_number || '',
        category_id: initialData?.category_id || '',
        latitude: initialData?.latitude || '',
        longitude: initialData?.longitude || '',
        key_persons: initialData?.key_persons || [
          { name: '', role: '', phone: '', email: '' },
          { name: '', role: '', phone: '', email: '' },
        ],
        is_active: initialData?.is_active ?? true,
      });
      setFormErrors({
        key_persons: [
          { name: '', role: '', phone: '', email: '' },
          { name: '', role: '', phone: '', email: '' },
        ]
      });
    }
  }, [open, initialData]);

  // Handle key person changes
  const handleKeyPersonChange = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      key_persons: prev.key_persons.map((kp, i) => 
        i === index ? { ...kp, [field]: value } : kp
      )
    }));
    
    // Clear error for this field
    setFormErrors(prev => ({
      ...prev,
      key_persons: prev.key_persons.map((kp, i) => 
        i === index ? { ...kp, [field]: '' } : kp
      )
    }));
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required';
        return '';
      case 'name_ar':
        if (!value) return 'Arabic name is required';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!EMAIL_REGEX.test(value)) return 'Invalid email format';
        return '';
      case 'phone':
        if (!value) return 'Phone is required';
        if (!PHONE_REGEX.test(value)) return 'Invalid phone format';
        return '';
      case 'whatsapp':
        if (!value) return 'WhatsApp is required';
        if (!PHONE_REGEX.test(value)) return 'Invalid WhatsApp format';
        return '';
      case 'password':
        if (!isEdit && !value) return 'Password is required';
        if (value && !PASSWORD_REGEX.test(value)) return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
        return '';
      case 'password_confirmation':
        if (!isEdit && !value) return 'Password confirmation is required';
        if (value && value !== form.password) return 'Passwords do not match';
        return '';
      case 'tax_card_number':
        if (!value) return 'Tax card number is required';
        return '';
      case 'cr_number':
        if (!value) return 'CR number is required';
        return '';
      case 'category_id':
        if (!value) return 'Category is required';
        return '';
      case 'latitude':
        if (!value) return 'Latitude is required';
        return '';
      case 'longitude':
        if (!value) return 'Longitude is required';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const errors = {};
    let isValid = true;

    // Validate main fields
    Object.keys(form).forEach(key => {
      if (key !== 'key_persons') {
        const error = validateField(key, form[key]);
        if (error) {
          errors[key] = error;
          isValid = false;
        }
      }
    });

    // Validate key persons
    const keyPersonErrors = form.key_persons.map((kp, index) => {
      const kpErrors = {};
      if (kp.name && !kp.role) {
        kpErrors.role = 'Role is required when name is provided';
        isValid = false;
      }
      if (kp.role && !kp.name) {
        kpErrors.name = 'Name is required when role is provided';
        isValid = false;
      }
      return kpErrors;
    });

    setFormErrors({ ...errors, key_persons: keyPersonErrors });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.show('Please fix the errors', 'error');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      toast.show(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <div className="p-8 max-h-[95vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-2xl font-bold text-theme-text mb-8 text-center">
          {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
        </h2>
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-theme-text mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Name (English) *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  className="theme-input w-full px-4 py-3 text-base"
                  placeholder="Enter supplier name"
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Name (Arabic) *
                </label>
                <input
                  type="text"
                  name="name_ar"
                  value={form.name_ar}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  className="theme-input w-full px-4 py-3 text-base"
                  placeholder="Enter supplier name in Arabic"
                  dir="rtl"
                  aria-invalid={!!formErrors.name_ar}
                />
                {formErrors.name_ar && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name_ar}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-theme-text mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  className="theme-input w-full px-4 py-3 text-base"
                  placeholder="Enter supplier email"
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  className="theme-input w-full px-4 py-3 text-base"
                  placeholder="Enter supplier phone"
                  aria-invalid={!!formErrors.phone}
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  className="theme-input w-full px-4 py-3 text-base"
                  placeholder="Enter supplier WhatsApp"
                  aria-invalid={!!formErrors.whatsapp}
                />
                {formErrors.whatsapp && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.whatsapp}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="theme-input w-full px-4 py-3 text-base"
                  disabled={categoriesLoading}
                  aria-invalid={!!formErrors.category_id}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formErrors.category_id && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.category_id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-theme-text mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Business Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Tax Card Number *
                </label>
                <input
                  type="text"
                  name="tax_card_number"
                  value={form.tax_card_number}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  className="theme-input w-full px-4 py-3 text-base"
                  placeholder="Enter tax card number"
                  aria-invalid={!!formErrors.tax_card_number}
                />
                {formErrors.tax_card_number && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.tax_card_number}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  CR Number *
                </label>
                <input
                  type="text"
                  name="cr_number"
                  value={form.cr_number}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  className="theme-input w-full px-4 py-3 text-base"
                  placeholder="Enter CR number"
                  aria-invalid={!!formErrors.cr_number}
                />
                {formErrors.cr_number && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.cr_number}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-theme-text mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  className="theme-input w-full px-4 py-3 text-base"
                  placeholder="Latitude will be auto-detected"
                  aria-invalid={!!formErrors.latitude}
                />
                {formErrors.latitude && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.latitude}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  className="theme-input w-full px-4 py-3 text-base"
                  placeholder="Longitude will be auto-detected"
                  aria-invalid={!!formErrors.longitude}
                />
                {formErrors.longitude && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.longitude}</p>
                )}
              </div>
            </div>
          </div>

          {/* Password Fields (only for new suppliers) */}
          {!isEdit && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-theme-text mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    className="theme-input w-full px-4 py-3 text-base"
                    placeholder="Enter your password"
                    aria-invalid={!!formErrors.password}
                  />
                  {formErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    className="theme-input w-full px-4 py-3 text-base"
                    placeholder="Confirm password"
                    aria-invalid={!!formErrors.password_confirmation}
                  />
                  {formErrors.password_confirmation && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.password_confirmation}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Key Persons */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-theme-text mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Key Persons
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Add key personnel for this supplier (optional)
            </p>
            {form.key_persons.map((kp, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 p-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
                <div className="col-span-4 mb-4">
                  <h4 className="text-md font-medium text-theme-text">Key Person {index + 1}</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={kp.name}
                    onChange={(e) => handleKeyPersonChange(index, 'name', e.target.value)}
                    className="theme-input w-full px-4 py-3 text-base"
                    placeholder="Enter name"
                  />
                  {formErrors.key_persons[index]?.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.key_persons[index].name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Role
                  </label>
                  <select
                    value={kp.role}
                    onChange={(e) => handleKeyPersonChange(index, 'role', e.target.value)}
                    className="theme-input w-full px-4 py-3 text-base"
                  >
                    {KEY_PERSON_ROLES.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.value || 'Select Role'}
                      </option>
                    ))}
                  </select>
                  {formErrors.key_persons[index]?.role && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.key_persons[index].role}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={kp.phone}
                    onChange={(e) => handleKeyPersonChange(index, 'phone', e.target.value)}
                    className="theme-input w-full px-4 py-3 text-base"
                    placeholder="Enter phone"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={kp.email}
                    onChange={(e) => handleKeyPersonChange(index, 'email', e.target.value)}
                    className="theme-input w-full px-4 py-3 text-base"
                    placeholder="Enter email"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-theme-text mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Account Status
            </h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm font-medium text-theme-text">Active</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
            <button
              type="button"
              onClick={onClose}
              className="theme-button-secondary px-4 py-2 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="theme-button px-4 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEdit ? 'Update Supplier' : 'Create Supplier'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 