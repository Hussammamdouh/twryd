import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../Common/ToastContext';
import Modal from '../Common/Modal';
import Spinner from '../supplier/Spinner';

export default function PlanFormModal({ open, onClose, onSubmit, initialData, isEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    max_clients: '',
    price_per_month: '',
    is_custom: false,
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Initialize form data when editing
  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        name: initialData.name || '',
        name_ar: initialData.name_ar || '',
        description: initialData.description || '',
        description_ar: initialData.description_ar || '',
        max_clients: initialData.max_clients || '',
        price_per_month: initialData.price_per_month || '',
        is_custom: initialData.is_custom || false,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
    } else {
      setFormData({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        max_clients: '',
        price_per_month: '',
        is_custom: false,
        is_active: true,
      });
    }
    setErrors({});
  }, [initialData, isEdit, open]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }

    if (!formData.name_ar.trim()) {
      newErrors.name_ar = 'Arabic plan name is required';
    }

    if (!formData.price_per_month || parseFloat(formData.price_per_month) < 0) {
      newErrors.price_per_month = 'Valid price is required';
    }

    if (formData.max_clients && parseInt(formData.max_clients) < 1) {
      newErrors.max_clients = 'Max clients must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.show('Please fix the errors', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        max_clients: formData.max_clients ? parseInt(formData.max_clients) : null,
        price_per_month: parseFloat(formData.price_per_month),
      };

      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
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
    <Modal open={open} onClose={handleClose} size="xl">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 sm:px-8 py-6 sm:py-8 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                  {isEdit ? 'Edit Plan' : 'Create New Plan'}
                </h2>
                <p className="text-blue-100 text-sm sm:text-base">
                  {isEdit ? 'Update plan details and settings' : 'Configure a new subscription plan for suppliers'}
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
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Plan Name (English) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.name 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      placeholder="Enter plan name in English"
                      disabled={loading}
                    />
                    {errors.name && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Plan Name (Arabic) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name_ar"
                      value={formData.name_ar}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.name_ar 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      placeholder="أدخل اسم الخطة بالعربية"
                      disabled={loading}
                      dir="rtl"
                    />
                    {errors.name_ar && (
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.name_ar && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.name_ar}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description (English)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
                    placeholder="Enter plan description in English"
                    rows="3"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description (Arabic)
                  </label>
                  <textarea
                    name="description_ar"
                    value={formData.description_ar}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
                    placeholder="أدخل وصف الخطة بالعربية"
                    rows="3"
                    disabled={loading}
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* Plan Configuration */}
            <div className="bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Plan Configuration</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Price per Month <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price_per_month"
                      value={formData.price_per_month}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pr-16 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.price_per_month 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">USD</span>
                    </div>
                    {errors.price_per_month && (
                      <div className="absolute inset-y-0 right-12 flex items-center pr-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.price_per_month && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.price_per_month}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Max Clients
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="max_clients"
                      value={formData.max_clients}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.max_clients 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      placeholder="Leave empty for unlimited"
                      min="1"
                      disabled={loading}
                    />
                    {errors.max_clients && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.max_clients && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.max_clients}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Leave empty for unlimited clients
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Settings */}
            <div className="bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Plan Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200">
                  <input
                    type="checkbox"
                    name="is_custom"
                    checked={formData.is_custom}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                      Custom Plan
                    </label>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Custom plans are created for specific suppliers and may have special pricing or features
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                      Active Plan
                    </label>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Active plans can be subscribed to by suppliers. Inactive plans are hidden from the marketplace
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                disabled={loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <Spinner size={16} color="border-white" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isEdit ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
} 