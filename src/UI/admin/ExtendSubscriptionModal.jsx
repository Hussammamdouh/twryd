import React, { useState, useCallback } from 'react';
import { useToast } from '../Common/ToastContext';
import Modal from '../Common/Modal';
import Spinner from '../supplier/Spinner';

export default function ExtendSubscriptionModal({ open, onClose, onSubmit, subscription }) {
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const handleChange = useCallback((e) => {
    const value = parseInt(e.target.value) || 1;
    setMonths(Math.max(1, Math.min(60, value))); // Limit between 1-60 months
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev.months) {
        const newErrors = { ...prev };
        delete newErrors.months;
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!months || months < 1) {
      newErrors.months = 'Number of months must be at least 1';
    }

    if (months > 60) {
      newErrors.months = 'Number of months cannot exceed 60';
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
      await onSubmit(months);
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMonths(1);
      setErrors({});
      onClose();
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  return (
    <Modal open={open} onClose={handleClose} size="large">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-3xl font-bold mb-1">
                  Extend Subscription
                </h2>
                <p className="text-yellow-100 text-xs sm:text-sm lg:text-base leading-tight">
                  Add more time to the subscription period
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
        <div className="p-3 sm:p-4 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Current Subscription Info */}
            {subscription && (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-3 sm:p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">Current Subscription</h3>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Supplier:</span>
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        {subscription.supplier?.name || subscription.supplier?.company_name || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Plan:</span>
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        {subscription.plan?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Price:</span>
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        {formatCurrency(subscription.price_per_month)}/month
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">End Date:</span>
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        {formatDate(subscription.end_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Extension Configuration */}
            <div className="bg-gradient-to-br from-gray-50 to-yellow-50 dark:from-gray-800 dark:to-yellow-900/20 p-3 sm:p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">Extension Configuration</h3>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Number of Months to Extend <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={months}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-16 border-2 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-sm sm:text-base ${
                        errors.months 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      placeholder="1"
                      min="1"
                      max="60"
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">months</span>
                    </div>
                  </div>
                  {errors.months && (
                    <p className="text-red-500 text-xs sm:text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.months}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter a number between 1 and 60 months
                  </p>
                </div>
              </div>
            </div>

            {/* Extension Preview */}
            {subscription && months > 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20 p-3 sm:p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">Extension Preview</h3>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Current End Date:</span>
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        {formatDate(subscription.end_date)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">New End Date:</span>
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        {subscription.end_date ? 
                          new Date(new Date(subscription.end_date).getTime() + (months * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          }) : 'N/A'
                        }
                      </p>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Additional Cost:</span>
                      <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency((subscription.price_per_month || 0) * months)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 text-xs sm:text-sm lg:text-base"
                disabled={loading}
              >
                {loading ? (
                  <Spinner size={16} color="border-white" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Extend Subscription
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
} 