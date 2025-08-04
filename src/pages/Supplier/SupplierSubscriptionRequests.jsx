import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { get, post } from '../../utils/api';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import Spinner from '../../UI/supplier/Spinner';
import FileUpload from '../../UI/Common/FileUpload';

export default function SupplierSubscriptionRequests({ onRefresh }) {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  
  const [requests, setRequests] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [formData, setFormData] = useState({
    plan_id: '',
    months_requested: 1,
    payment_proof: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, plansRes, pendingRes] = await Promise.all([
        get('/api/supplier/subscription-requests', { token }),
        get('/api/supplier/plans', { token }),
        get('/api/supplier/subscription-requests/has-pending', { token })
      ]);
      
      setRequests(requestsRes.data?.requests || requestsRes.data || []);
      setPlans(plansRes.data?.plans || plansRes.data || []);
      setHasPendingRequest(pendingRes.data?.has_pending || false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.show(t('messages.failed_to_load'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = () => {
    setFormData({
      plan_id: '',
      months_requested: 1,
      payment_proof: null
    });
    setFormErrors({});
    setCalculatedPrice(null);
    setShowCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
    setFormData({
      plan_id: '',
      months_requested: 1,
      payment_proof: null
    });
    setFormErrors({});
    setCalculatedPrice(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (file) => {
    setFormData(prev => ({
      ...prev,
      payment_proof: file
    }));
    
    if (formErrors.payment_proof) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.payment_proof;
        return newErrors;
      });
    }
  };

  const calculatePrice = async () => {
    if (!formData.plan_id || !formData.months_requested) return;
    
    try {
      const response = await post('/api/supplier/subscription-requests/calculate-price', {
        data: {
          plan_id: formData.plan_id,
          months_requested: parseInt(formData.months_requested)
        },
        token
      });
      setCalculatedPrice(response.data);
    } catch (err) {
      console.error('Failed to calculate price:', err);
      toast.show(t('messages.failed_to_calculate_price'), 'error');
    }
  };

  useEffect(() => {
    if (formData.plan_id && formData.months_requested) {
      calculatePrice();
    }
  }, [formData.plan_id, formData.months_requested]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.plan_id) {
      errors.plan_id = t('supplier_subscriptions.plan_required');
    }
    
    if (!formData.months_requested || formData.months_requested < 1) {
      errors.months_requested = t('supplier_subscriptions.months_required');
    }
    
    if (!formData.payment_proof) {
      errors.payment_proof = t('supplier_subscriptions.payment_proof_required');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.show(t('messages.please_fix_errors'), 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('plan_id', formData.plan_id);
      formDataToSend.append('months_requested', formData.months_requested);
      if (formData.payment_proof) {
        formDataToSend.append('payment_proof', formData.payment_proof);
      }
      
      await post('/api/supplier/subscription-requests', {
        data: formDataToSend,
        token,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.show(t('supplier_subscriptions.request_created_success'), 'success');
      handleCloseCreateForm();
      fetchData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to create request:', err);
      toast.show(err.message || t('messages.operation_failed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewRequestDetails = async (requestId) => {
    try {
      const response = await get(`/api/supplier/subscription-requests/${requestId}`, { token });
      setSelectedRequest(response.data);
      setShowRequestDetails(true);
    } catch (err) {
      console.error('Failed to fetch request details:', err);
      toast.show(t('messages.failed_to_load'), 'error');
    }
  };

  const handleCloseRequestDetails = () => {
    setShowRequestDetails(false);
    setSelectedRequest(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'approved':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'rejected':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="w-full">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('supplier_subscriptions.subscription_requests')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('supplier_subscriptions.requests_description')}
          </p>
        </div>
        {!hasPendingRequest && (
          <button
            onClick={handleCreateRequest}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('supplier_subscriptions.create_request')}
          </button>
        )}
      </div>

      {/* Pending Request Warning */}
      {hasPendingRequest && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t('supplier_subscriptions.pending_request_warning')}
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {t('supplier_subscriptions.pending_request_description')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('supplier_subscriptions.no_requests')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('supplier_subscriptions.no_requests_description')}
          </p>
          {!hasPendingRequest && (
            <button
              onClick={handleCreateRequest}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('supplier_subscriptions.create_first_request')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${getStatusColor(request.status)}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {request.plan?.name || t('supplier_subscriptions.unknown_plan')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('supplier_subscriptions.requested_for')} {request.months_requested} {t('supplier_subscriptions.months')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {t(`supplier_subscriptions.status_${request.status}`)}
                  </span>
                  <button
                    onClick={() => handleViewRequestDetails(request.id)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    {t('supplier_subscriptions.view_details')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('supplier_subscriptions.create_subscription_request')}
                </h3>
                <button
                  onClick={handleCloseCreateForm}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('supplier_subscriptions.select_plan')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="plan_id"
                  value={formData.plan_id}
                  onChange={handleFormChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    formErrors.plan_id 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <option value="">{t('supplier_subscriptions.choose_plan')}</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.price_per_month}/month
                    </option>
                  ))}
                </select>
                {formErrors.plan_id && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.plan_id}</p>
                )}
              </div>

              {/* Months Requested */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('supplier_subscriptions.months_requested')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="months_requested"
                  value={formData.months_requested}
                  onChange={handleFormChange}
                  min="1"
                  max="12"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    formErrors.months_requested 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                />
                {formErrors.months_requested && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.months_requested}</p>
                )}
              </div>

              {/* Calculated Price */}
              {calculatedPrice && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    {t('supplier_subscriptions.calculated_price')}
                  </h4>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ${calculatedPrice.total_price}
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {t('supplier_subscriptions.price_breakdown', { 
                      monthly: calculatedPrice.monthly_price, 
                      months: formData.months_requested 
                    })}
                  </p>
                </div>
              )}

              {/* Payment Proof Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('supplier_subscriptions.payment_proof')} <span className="text-red-500">*</span>
                </label>
                <FileUpload
                  onFileSelect={handleFileChange}
                  acceptedTypes={['image/*', 'application/pdf']}
                  maxSize={5} // 5MB
                  placeholder={t('supplier_subscriptions.upload_payment_proof')}
                />
                {formErrors.payment_proof && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.payment_proof}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t('supplier_subscriptions.payment_proof_help')}
                </p>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={handleCloseCreateForm}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Spinner size={16} color="border-white" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {t('supplier_subscriptions.submit_request')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {showRequestDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('supplier_subscriptions.request_details')}
                </h3>
                <button
                  onClick={handleCloseRequestDetails}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                  {t(`supplier_subscriptions.status_${selectedRequest.status}`)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(selectedRequest.created_at)}
                </span>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('supplier_subscriptions.request_information')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.request_id')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedRequest.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.plan')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedRequest.plan?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.months_requested')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedRequest.months_requested}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.total_amount')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">${selectedRequest.total_amount}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Proof */}
                {selectedRequest.payment_proof && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('supplier_subscriptions.payment_proof')}
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <a
                        href={selectedRequest.payment_proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {t('supplier_subscriptions.view_payment_proof')}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              {selectedRequest.admin_notes && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('supplier_subscriptions.admin_notes')}
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">{selectedRequest.admin_notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCloseRequestDetails}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 