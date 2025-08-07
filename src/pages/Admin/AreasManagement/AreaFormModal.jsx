import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import Modal from '../../../UI/Common/Modal';

export default function AreaFormModal({ open, onClose, onSubmit, initialData, isEdit, governorates }) {
  const [form, setForm] = useState({ 
    name: '', 
    governorate_id: '',
    polygon: [
      { lat: 30.0444, lng: 31.2357 },
      { lat: 30.0544, lng: 31.2457 },
      { lat: 30.0644, lng: 31.2557 },
      { lat: 30.0444, lng: 31.2357 }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { t } = useLanguage();

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || '',
        governorate_id: initialData?.governorate_id || '',
        polygon: initialData?.polygon || [
          { lat: 30.0444, lng: 31.2357 },
          { lat: 30.0544, lng: 31.2457 },
          { lat: 30.0644, lng: 31.2557 },
          { lat: 30.0444, lng: 31.2357 }
        ]
      });
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = t('areas.name') + ' ' + t('form.required').toLowerCase();
    }
    if (!form.governorate_id) {
      newErrors.governorate_id = t('areas.select_governorate');
    }
    if (!form.polygon || form.polygon.length < 3) {
      newErrors.polygon = t('areas.polygon_points') + ' ' + t('form.required').toLowerCase();
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch {
      // Error is already handled in the parent component
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
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 via-teal-600 to-emerald-500 text-white px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8 rounded-t-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-3xl font-bold mb-1">
                  {isEdit ? t('modal.edit_area') : t('modal.add_area')}
                </h2>
                <p className="text-green-100 text-xs sm:text-sm lg:text-base leading-tight">
                  {isEdit ? t('areas.update_area_info_settings') : t('areas.add_new_area_platform')}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
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
            <div className="bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20 p-3 sm:p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('areas.area_information')}
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('areas.name')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="name"
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    maxLength={50}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm sm:text-base ${
                      errors.name 
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/30 focus:ring-red-400 focus:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                    placeholder={t('form.placeholder.area_name')}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <div id="name-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label htmlFor="governorate_id" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('areas.governorate')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="governorate_id"
                    name="governorate_id"
                    value={form.governorate_id}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm sm:text-base ${
                      errors.governorate_id 
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/30 focus:ring-red-400 focus:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                    aria-invalid={!!errors.governorate_id}
                    aria-describedby={errors.governorate_id ? 'governorate-error' : undefined}
                  >
                    <option value="">{t('areas.select_governorate')}</option>
                    {governorates.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  {errors.governorate_id && (
                    <div id="governorate-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {errors.governorate_id}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Polygon Information */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-3 sm:p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('areas.geographic_boundaries')}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('areas.polygon_points')} <span className="text-red-500">*</span>
                  </label>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {t('areas.polygon_description')}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 font-medium">{t('areas.current_polygon_points')}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {form.polygon.map((point, index) => (
                        <div key={index} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
                          <span className="font-medium">{t('areas.point', {index: index + 1})}</span> {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                        </div>
                      ))}
                    </div>
                  </div>
                  {errors.polygon && (
                    <div className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {errors.polygon}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 sm:pt-6">
              <button 
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 text-sm sm:text-base"
              >
                {t('form.cancel')}
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:from-green-800 focus:to-emerald-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {loading ? (isEdit ? t('form.save') + '...' : t('form.create') + '...') : (isEdit ? t('form.save') + ' ' + t('areas.changes') : t('form.create') + ' ' + t('areas.area'))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
