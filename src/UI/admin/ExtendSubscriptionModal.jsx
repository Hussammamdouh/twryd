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
    <Modal open={open} onClose={handleClose} size="medium">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Extend Subscription</h2>
                <p className="text-yellow-100 text-sm">
                  Add more time to the subscription
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {subscription && (
            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Current Subscription</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Supplier:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {subscription.supplier?.name || subscription.supplier?.company_name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {subscription.plan?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(subscription.price_per_month)}/month
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(subscription.end_date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Number of Months to Extend <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={months}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-16 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ${
                    errors.months 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                  placeholder="1"
                  min="1"
                  max="60"
                  disabled={loading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">months</span>
                </div>
              </div>
              {errors.months && (
                <p className="text-red-500 text-sm flex items-center gap-1">
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

            {/* Extension Preview */}
            {subscription && months > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Extension Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Current End Date:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {formatDate(subscription.end_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">New End Date:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {subscription.end_date ? 
                        new Date(new Date(subscription.end_date).getTime() + (months * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }) : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Additional Cost:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {formatCurrency((subscription.price_per_month || 0) * months)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold rounded-lg transition-all duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
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