import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../Common/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Modal from '../Common/Modal';
import Spinner from '../supplier/Spinner';
import { get } from '../../utils/api';

export default function SubscriptionFormModal({ open, onClose, onSubmit, initialData, isEdit, token }) {
  const [formData, setFormData] = useState({
    supplier_id: '',
    plan_id: '',
    start_date: '',
    end_date: '',
    price_per_month: '',
    months: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);
  const toast = useToast();
  const { t } = useLanguage();

  // Fetch suppliers and plans
  const fetchData = useCallback(async () => {
    if (!token) {
      toast.show(t('messages.authentication_missing'), 'error');
      return;
    }
    
    setFetchingData(true);
    try {
      const [suppliersRes, plansRes] = await Promise.all([
        get('/api/v1/suppliers', { token }),
        get('/api/admin/plans', { token })
      ]);
      
      const suppliersData = suppliersRes.data?.suppliers?.data || suppliersRes.data?.suppliers || suppliersRes.data || [];
      const plansData = plansRes.data?.plans?.data || plansRes.data?.plans || plansRes.data || [];
      
      setSuppliers(suppliersData);
      setPlans(plansData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.show(t('messages.failed_to_load'), 'error');
    } finally {
      setFetchingData(false);
    }
  }, [token, toast, t]);

  // Initialize form data when editing
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        supplier_id: initialData.supplier_id || initialData.supplier?.id || '',
        plan_id: initialData.plan_id || initialData.plan?.id || '',
        start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
        end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
        price_per_month: initialData.price_per_month || '',
        months: initialData.months || '',
        status: initialData.status || 'active',
      });
    } else {
      setFormData({
        supplier_id: '',
        plan_id: '',
        start_date: '',
        end_date: '',
        price_per_month: '',
        months: '',
        status: 'active',
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

  // Auto-fill price when plan is selected
  useEffect(() => {
    if (formData.plan_id && !isEdit) {
      const selectedPlan = plans.find(plan => plan.id == formData.plan_id);
      if (selectedPlan) {
        setFormData(prev => ({
          ...prev,
          price_per_month: selectedPlan.price_per_month || ''
        }));
      }
    }
  }, [formData.plan_id, plans, isEdit]);

  // Calculate months from start and end dates
  const calculateMonths = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
    return diffMonths;
  };

  // Auto-calculate months when start and end dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const months = calculateMonths(formData.start_date, formData.end_date);
      setFormData(prev => ({
        ...prev,
        months: months.toString()
      }));
    }
  }, [formData.start_date, formData.end_date]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = t('subscriptions.supplier_required');
    }

    if (!formData.plan_id) {
      newErrors.plan_id = t('subscriptions.plan_required');
    }

    if (!formData.start_date) {
      newErrors.start_date = t('subscriptions.start_date_required');
    }

    if (!formData.end_date) {
      newErrors.end_date = t('subscriptions.end_date_required');
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        newErrors.end_date = t('subscriptions.end_date_after_start');
      }
    }

    if (!formData.price_per_month || parseFloat(formData.price_per_month) < 0) {
      newErrors.price_per_month = t('subscriptions.price_required');
    }

    if (!formData.months || parseInt(formData.months) <= 0) {
      newErrors.months = t('subscriptions.months_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.show(t('messages.please_fix_errors'), 'error');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        price_per_month: parseFloat(formData.price_per_month),
        months: parseInt(formData.months),
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white px-6 sm:px-8 py-6 sm:py-8 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                  {isEdit ? t('subscriptions.edit') : t('subscriptions.create')}
                </h2>
                <p className="text-green-100 text-sm sm:text-base">
                  {isEdit ? t('subscriptions.update_description') : t('subscriptions.create_description')}
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
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
          {fetchingData ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size={32} />
              <span className="ml-3 text-gray-600 dark:text-gray-400">{t('subscriptions.loading_suppliers_plans')}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Subscription Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('subscriptions.subscription_details')}</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('subscriptions.supplier')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="supplier_id"
                        value={formData.supplier_id}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                          errors.supplier_id 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        disabled={loading}
                      >
                        <option value="">{t('subscriptions.select_supplier')}</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name || supplier.company_name} ({supplier.email})
                          </option>
                        ))}
                      </select>
                      {errors.supplier_id && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.supplier_id && (
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.supplier_id}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('subscriptions.plan')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="plan_id"
                        value={formData.plan_id}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                          errors.plan_id 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        disabled={loading}
                      >
                        <option value="">{t('subscriptions.select_plan')}</option>
                        {plans.map(plan => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(plan.price_per_month)}/month
                          </option>
                        ))}
                      </select>
                      {errors.plan_id && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.plan_id && (
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.plan_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date and Duration */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('subscriptions.date_and_duration')}</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('subscriptions.start_date')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                          errors.start_date 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        disabled={loading}
                      />
                      {errors.start_date && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.start_date && (
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.start_date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('subscriptions.end_date')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                          errors.end_date 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        disabled={loading}
                      />
                      {errors.end_date && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.end_date && (
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.end_date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('subscriptions.months')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="months"
                        value={formData.months}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                          errors.months 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        placeholder="0"
                        min="1"
                        step="1"
                        disabled={loading}
                      />
                      {errors.months && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.months && (
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.months}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('subscriptions.pricing')}</h3>
                </div>
                
                <div className="w-full">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('subscriptions.price_per_month')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price_per_month"
                        value={formData.price_per_month}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 pr-16 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
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
                </div>
              </div>

              {/* Status */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('subscriptions.status')}</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="w-full">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
                      disabled={loading}
                    >
                      <option value="active">{t('subscriptions.active')}</option>
                      <option value="inactive">{t('subscriptions.inactive')}</option>
                      <option value="cancelled">{t('subscriptions.cancelled')}</option>
                      <option value="expired">{t('subscriptions.expired')}</option>
                    </select>
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
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner size={16} color="border-white" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isEdit ? t('subscriptions.update') : t('subscriptions.create')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
} 