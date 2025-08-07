import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../UI/Common/ToastContext';
import Modal from '../../../UI/Common/Modal';
import FileUpload from '../../../UI/Common/FileUpload';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back.twryd.com';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function getIconUrl(icon) {
  if (!icon) return null;
  if (icon.startsWith('http')) return icon;
  const cleanPath = icon.replace(/^\//, '');
  return `${API_BASE_URL}/storage/${cleanPath}`;
}

export default function CategoryFormModal({ open, onClose, onSubmit, initialData, isEdit }) {
  const [form, setForm] = useState({
    name: '',
    name_ar: '',
    icon: null,
    is_active: true,
    remove_icon: false,
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const toast = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || '',
        name_ar: initialData?.name_ar || '',
        icon: null,
        is_active: initialData?.is_active ?? true,
        remove_icon: false,
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  function validateField(name, value, files) {
    switch (name) {
      case 'name':
        if (!value) return t('form.name_required');
        return '';
      case 'name_ar':
        if (!value) return t('categories.name_ar') + ' ' + t('form.required').toLowerCase() + '.';
        return '';
      case 'icon': {
        const file = files ? files[0] : form.icon;
        if (!isEdit && !file) return t('categories.icon_required');
        if (file && !file.type.startsWith('image/')) return t('validation.image_type');
        if (file && file.size > MAX_FILE_SIZE) return t('validation.file_size', { size: 2 });
        return '';
      }
      default:
        return '';
    }
  }

  function validateAll() {
    const errors = {};
    errors.name = validateField('name', form.name);
    errors.name_ar = validateField('name_ar', form.name_ar);
    errors.icon = validateField('icon', form.icon);
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, icon: files[0] }));
      // Clear error when user selects a file
      setFormErrors((prev) => {
        if (prev.icon) {
          const newErrors = { ...prev };
          delete newErrors.icon;
          return newErrors;
        }
        return prev;
      });
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      // Clear error when user starts typing - only if there's an error
      setFormErrors((prev) => {
        if (prev[name]) {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
        return prev;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.show(t('messages.please_fix_errors'), 'error');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('name_ar', form.name_ar);
      if (form.icon) formData.append('icon', form.icon);
      formData.append('is_active', form.is_active ? '1' : '0');
      if (isEdit && form.remove_icon) formData.append('remove_icon', '1');
      await onSubmit(formData);
      toast.show(isEdit ? t('categories.updated') : t('categories.created'), 'success');
      onClose();
    } catch (err) {
      toast.show(err.message || 'Failed to submit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="large">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
        {/* Enhanced Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-500 text-white px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8 rounded-t-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-3xl font-bold mb-1">
                  {isEdit ? t('modal.edit_category') : t('modal.add_category')}
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base leading-tight">
                  {isEdit ? t('categories.update_category_info_settings') : t('categories.add_new_category_platform')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              disabled={loading}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-3 sm:p-4 lg:p-8 pt-6 sm:pt-8 lg:pt-12 bg-gray-50/30 dark:bg-gray-800/30">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8" noValidate>
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-3 sm:p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('categories.basic_information')}</h3>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('categories.name_en')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="name"
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    maxLength={50}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base ${
                      formErrors.name 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    placeholder={t('form.placeholder.category_name_en')}
                    aria-invalid={!!formErrors.name}
                    aria-describedby={formErrors.name ? 'name-error' : undefined}
                    disabled={loading}
                  />
                  {formErrors.name && (
                    <div id="name-error" className="text-red-500 text-xs sm:text-sm flex items-center gap-2" role="alert">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="name_ar" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('categories.name_ar')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="name_ar"
                    name="name_ar" 
                    value={form.name_ar} 
                    onChange={handleChange} 
                    required 
                    maxLength={50}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base ${
                      formErrors.name_ar 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    placeholder={t('form.placeholder.category_name_ar')}
                    dir="rtl"
                    aria-invalid={!!formErrors.name_ar}
                    aria-describedby={formErrors.name_ar ? 'name-ar-error' : undefined}
                    disabled={loading}
                  />
                  {formErrors.name_ar && (
                    <div id="name-ar-error" className="text-red-500 text-xs sm:text-sm flex items-center gap-2" role="alert">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.name_ar}
                    </div>
                  )}
                </div>
              </div>
            </div>
        
            {/* Media & Settings */}
            <div className="bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 p-3 sm:p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('categories.media_settings')}</h3>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <FileUpload
                  id="icon"
                  name="icon"
                  accept="image/*"
                  required={!isEdit}
                  onChange={handleChange}
                  label={`${t('categories.icon')} ${isEdit ? `(${t('form.optional')})` : `(${t('form.required')})`}`}
                  error={formErrors.icon}
                  maxSize={1 * 1024 * 1024} // 1MB
                />
        
                {isEdit && initialData?.icon && (
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <img src={getIconUrl(initialData.icon)} alt="Current icon" className="w-8 h-8 object-cover rounded" />
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input 
                        type="checkbox" 
                        name="remove_icon" 
                        checked={form.remove_icon} 
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        disabled={loading}
                      /> 
                      {t('categories.remove_icon')}
                    </label>
                  </div>
                )}
                
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200">
                  <input 
                    id="is_active" 
                    name="is_active" 
                    type="checkbox" 
                    checked={form.is_active} 
                    onChange={handleChange} 
                    className="mt-1 w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                      {t('categories.active_category')}
                    </label>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                      {t('categories.inactive_categories_warning')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 lg:gap-4 pt-3 sm:pt-4 lg:pt-6 border-t border-gray-200 dark:border-gray-600">
              <button 
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t('form.cancel')}
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 text-xs sm:text-sm lg:text-base"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {loading ? (isEdit ? t('form.save') + '...' : t('form.create') + '...') : (isEdit ? t('form.save') + ' ' + t('common.changes') : t('form.create') + ' ' + t('nav.categories').slice(0, -1))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
} 