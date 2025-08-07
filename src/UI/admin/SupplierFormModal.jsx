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
    const keyPersonErrors = form.key_persons.map((kp) => {
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

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} size="large">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
                             <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                 <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                                 <h2 className="text-lg sm:text-xl lg:text-3xl font-bold mb-1">
                   {isEdit ? t('suppliers.edit_supplier') : t('suppliers.create_new_supplier')}
        </h2>
                 <p className="text-blue-100 text-xs sm:text-sm lg:text-base leading-tight">
                   {isEdit ? t('suppliers.update_supplier_info_settings') : t('suppliers.add_new_supplier_platform')}
                 </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-3 sm:p-4 lg:p-8">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Basic Information */}
             <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-3 sm:p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
                             <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                 <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                   <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
                </div>
                                 <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('suppliers.basic_information')}</h3>
              </div>
              
                               <div className="space-y-6">
                <div className="space-y-3">
                                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                     {t('suppliers.name_english')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                     className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base ${
                       formErrors.name 
                         ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                         : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                     }`}
                  placeholder={t('suppliers.enter_supplier_name')}
                     disabled={loading}
                />
                {formErrors.name && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.name}
                    </p>
                )}
              </div>
              
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('suppliers.name_arabic')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_ar"
                  value={form.name_ar}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      formErrors.name_ar 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    placeholder={t('suppliers.enter_supplier_name_arabic')}
                    disabled={loading}
                  dir="rtl"
                />
                {formErrors.name_ar && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.name_ar}
                    </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
                           <div className="bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20 p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                   <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
                 </div>
                 <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('suppliers.contact_information')}</h3>
               </div>
               
               <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('suppliers.email')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                      formErrors.email 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  placeholder={t('suppliers.enter_supplier_email')}
                    disabled={loading}
                />
                {formErrors.email && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.email}
                    </p>
                )}
              </div>
              
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('suppliers.phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                      formErrors.phone 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  placeholder={t('suppliers.enter_supplier_phone')}
                    disabled={loading}
                />
                {formErrors.phone && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.phone}
                    </p>
                  )}
            </div>
            
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('suppliers.whatsapp')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                      formErrors.whatsapp 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  placeholder={t('suppliers.enter_supplier_whatsapp')}
                    disabled={loading}
                />
                {formErrors.whatsapp && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.whatsapp}
                    </p>
                )}
              </div>
              
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('suppliers.category')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                      formErrors.category_id 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    disabled={categoriesLoading || loading}
                >
                  <option value="">{t('suppliers.select_category')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formErrors.category_id && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.category_id}
                    </p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
                           <div className="bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                   <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
                 </div>
                 <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('suppliers.business_information')}</h3>
               </div>
               
               <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('suppliers.tax_card_number')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tax_card_number"
                  value={form.tax_card_number}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                      formErrors.tax_card_number 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  placeholder={t('suppliers.enter_tax_card_number')}
                    disabled={loading}
                />
                {formErrors.tax_card_number && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.tax_card_number}
                    </p>
                )}
              </div>
              
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('suppliers.cr_number')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cr_number"
                  value={form.cr_number}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                      formErrors.cr_number 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  placeholder={t('suppliers.enter_cr_number')}
                    disabled={loading}
                />
                {formErrors.cr_number && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.cr_number}
                    </p>
                )}
              </div>
            </div>
          </div>

                         {/* Location Information */}
                           <div className="bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-800 dark:to-orange-900/20 p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                   <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
                 </div>
                 <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('suppliers.location_information')}</h3>
               </div>
               
               <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('suppliers.latitude')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${
                      formErrors.latitude 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  placeholder={t('suppliers.latitude_auto_detected')}
                    disabled={loading}
                />
                {formErrors.latitude && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.latitude}
                    </p>
                )}
              </div>
              
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('suppliers.longitude')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${
                      formErrors.longitude 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  placeholder={t('suppliers.longitude_auto_detected')}
                    disabled={loading}
                />
                {formErrors.longitude && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.longitude}
                    </p>
                )}
              </div>
            </div>
          </div>

          {/* Password Fields (only for new suppliers) */}
          {!isEdit && (
                             <div className="bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-800 dark:to-red-900/20 p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                  </div>
                                     <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('suppliers.security_information')}</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('suppliers.password')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${
                        formErrors.password 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    placeholder={t('suppliers.enter_password')}
                      disabled={loading}
                  />
                  {formErrors.password && (
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formErrors.password}
                      </p>
                  )}
                </div>
                
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('suppliers.confirm_password')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${
                        formErrors.password_confirmation 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    placeholder={t('suppliers.confirm_password_placeholder')}
                      disabled={loading}
                  />
                  {formErrors.password_confirmation && (
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formErrors.password_confirmation}
                      </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Key Persons */}
                         <div className="bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
                </div>
                                 <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('suppliers.key_persons')}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              {t('suppliers.add_key_personnel_optional')}
            </p>
            {form.key_persons.map((kp, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm p-6 mb-4">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{index + 1}</span>
                    </div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">{t('suppliers.key_person')} {index + 1}</h4>
                </div>
                                     <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('suppliers.name')}
                  </label>
                  <input
                    type="text"
                    value={kp.name}
                    onChange={(e) => handleKeyPersonChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
                    placeholder={t('suppliers.enter_name')}
                        disabled={loading}
                  />
                  {formErrors.key_persons[index]?.name && (
                        <p className="text-red-500 text-sm flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formErrors.key_persons[index].name}
                        </p>
                  )}
                </div>
                
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('suppliers.role')}
                  </label>
                  <select
                    value={kp.role}
                    onChange={(e) => handleKeyPersonChange(index, 'role', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
                        disabled={loading}
                  >
                    {KEY_PERSON_ROLES.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.value || t('suppliers.select_role')}
                      </option>
                    ))}
                  </select>
                  {formErrors.key_persons[index]?.role && (
                        <p className="text-red-500 text-sm flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formErrors.key_persons[index].role}
                        </p>
                  )}
                </div>
                
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('suppliers.phone')}
                  </label>
                  <input
                    type="tel"
                    value={kp.phone}
                    onChange={(e) => handleKeyPersonChange(index, 'phone', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
                    placeholder={t('suppliers.enter_phone')}
                        disabled={loading}
                  />
                </div>
                
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('suppliers.email')}
                  </label>
                  <input
                    type="email"
                    value={kp.email}
                    onChange={(e) => handleKeyPersonChange(index, 'email', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
                    placeholder={t('suppliers.enter_email')}
                        disabled={loading}
                  />
                    </div>
                </div>
              </div>
            ))}
          </div>

            {/* Account Status */}
                         <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-900/20 p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
                </div>
                                 <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('suppliers.account_status')}</h3>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  disabled={loading}
              />
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                    {t('suppliers.active_account')}
            </label>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {t('suppliers.active_account_description')}
                  </p>
                </div>
              </div>
          </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 lg:gap-4 pt-3 sm:pt-4 lg:pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
                 onClick={handleClose}
                 className="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base"
              disabled={loading}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              {t('form.cancel')}
            </button>
            <button
              type="submit"
                 className="px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 text-xs sm:text-sm lg:text-base"
              disabled={loading}
            >
              {loading ? (
                  <Spinner size={16} color="border-white" />
              ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
              )}
                {isEdit ? t('suppliers.update_supplier') : t('suppliers.create_supplier')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </Modal>
  );
} 