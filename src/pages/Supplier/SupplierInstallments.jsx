import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { get, post, put, patch } from '../../utils/api';
import { useToast } from '../../UI/Common/ToastContext';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import Modal from '../../UI/Common/Modal';
import { useNavigate } from 'react-router-dom';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '-';
  }
};

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount) return '0.00';
  return parseFloat(amount).toFixed(2);
};

// Helper function to get status badge
const getStatusBadge = (status, dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        Paid
      </span>
    );
  }
  
  if (status === 'overdue') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
        Overdue
      </span>
    );
  }
  
  if (due < today) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
        Overdue
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
      Pending
    </span>
  );
};

export default function SupplierInstallments() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'view'
  const [formData, setFormData] = useState({
    installments: [
      { due_date: '', amount: '' }
    ]
  });
  const [submitting, setSubmitting] = useState(false);
  const { token, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Handle 401 errors
  const handleAuthError = (error) => {
    if (error.message.includes('Session expired') || error.message.includes('Unauthorized') || error.status === 401) {
      toast.show('Session expired. Please log in again.', 'error');
      logout();
      navigate('/login-supplier');
    } else {
      // Show the actual error message for other errors
      toast.show(error.message || 'An error occurred', 'error');
    }
  };

  // Fetch orders with installments
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await get('/api/supplier/orders', { token });
      
      // Handle different possible response structures
      const ordersData = res.data?.orders || res.data || res || [];
      
      // For now, let's assume all orders can potentially have installments
      const ordersWithInstallmentFlag = ordersData.map(order => ({
        ...order,
        has_installments: order.has_installments || false
      }));
      
      setOrders(ordersWithInstallmentFlag);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch installments for a specific order
  const fetchInstallments = async (orderId) => {
    try {
      const res = await get(`/api/supplier/installments/order/${orderId}`, { token });
      setInstallments(res.data?.installments || res.data || []);
    } catch (err) {
      handleAuthError(err);
    }
  };

  // Create installment plan
  const createInstallmentPlan = async () => {
    if (!selectedOrder) return;
    
    // Check if token exists
    if (!token) {
      toast.show('No authentication token found. Please log in again.', 'error');
      logout();
      navigate('/login-supplier');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Validate form data
      const validInstallments = formData.installments.filter(inst => 
        inst.due_date && inst.amount && parseFloat(inst.amount) > 0
      );
      
      if (validInstallments.length === 0) {
        toast.show('Please add at least one valid installment', 'error');
        return;
      }
      
      // Prepare the request data
      const requestData = {
        installments: validInstallments.map(inst => ({
          due_date: inst.due_date,
          amount: parseFloat(inst.amount)
        }))
      };
      
      console.log('Sending request with token:', token ? 'Token exists' : 'No token');
      console.log('Request data:', requestData);
      
      // Make the API call
      const res = await post(`/api/supplier/installments/order/${selectedOrder.id}/create`, { 
        data: requestData, 
        token 
      });
      
      if (res.success) {
        toast.show('Installment plan created successfully', 'success');
        setModalOpen(false);
        // Refresh the orders list to update the has_installments flag
        fetchOrders();
        // Fetch the new installments for viewing
        fetchInstallments(selectedOrder.id);
      } else {
        toast.show(res.message || 'Failed to create installment plan', 'error');
      }
    } catch (err) {
      console.error('Create installment error:', err);
      if (err.status === 401 || err.message?.includes('Unauthorized')) {
        handleAuthError(err);
      } else {
        toast.show(err.message || 'Failed to create installment plan', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Update installment plan
  const updateInstallmentPlan = async () => {
    if (!selectedOrder) return;
    
    try {
      setSubmitting(true);
      
      // Validate form data
      const validInstallments = formData.installments.filter(inst => 
        inst.due_date && inst.amount && parseFloat(inst.amount) > 0
      );
      
      if (validInstallments.length === 0) {
        toast.show('Please add at least one valid installment', 'error');
        return;
      }
      
      // Prepare the request data
      const requestData = {
        installments: validInstallments.map(inst => ({
          due_date: inst.due_date,
          amount: parseFloat(inst.amount)
        }))
      };
      
      // Make the API call
      const res = await put(`/api/supplier/installments/order/${selectedOrder.id}/update`, { 
        data: requestData, 
        token 
      });
      
      if (res.success) {
        toast.show('Installment plan updated successfully', 'success');
        setModalOpen(false);
        // Refresh the installments
        fetchInstallments(selectedOrder.id);
      } else {
        toast.show(res.message || 'Failed to update installment plan', 'error');
      }
    } catch (err) {
      console.error('Update installment error:', err);
      if (err.status === 401 || err.message?.includes('Unauthorized')) {
        handleAuthError(err);
      } else {
        toast.show(err.message || 'Failed to update installment plan', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Mark installment as paid
  const markAsPaid = async (installmentId) => {
    try {
      const res = await patch(`/api/supplier/installments/installments/${installmentId}/mark-paid`, { 
        data: {}, 
        token 
      });
      if (res.success) {
        toast.show('Installment marked as paid', 'success');
        fetchInstallments(selectedOrder.id);
      } else {
        toast.show(res.message || 'Failed to mark as paid', 'error');
      }
    } catch (err) {
      console.error('Mark as paid error:', err);
      if (err.status === 401 || err.message?.includes('Unauthorized')) {
        handleAuthError(err);
      } else {
        toast.show(err.message || 'Failed to mark as paid', 'error');
      }
    }
  };

  // Mark installment as overdue
  const markAsOverdue = async (installmentId) => {
    try {
      const res = await patch(`/api/supplier/installments/installments/${installmentId}/mark-overdue`, { 
        data: {}, 
        token 
      });
      if (res.success) {
        toast.show('Installment marked as overdue', 'success');
        fetchInstallments(selectedOrder.id);
      } else {
        toast.show(res.message || 'Failed to mark as overdue', 'error');
      }
    } catch (err) {
      console.error('Mark as overdue error:', err);
      if (err.status === 401 || err.message?.includes('Unauthorized')) {
        handleAuthError(err);
      } else {
        toast.show(err.message || 'Failed to mark as overdue', 'error');
      }
    }
  };

  // Handle form changes
  const handleFormChange = useCallback((index, field, value) => {
    const newInstallments = [...formData.installments];
    newInstallments[index] = { ...newInstallments[index], [field]: value };
    setFormData({ installments: newInstallments });
  }, [formData.installments]);

  // Add installment row
  const addInstallmentRow = () => {
    setFormData({
      installments: [...formData.installments, { due_date: '', amount: '' }]
    });
  };

  // Remove installment row
  const removeInstallmentRow = (index) => {
    if (formData.installments.length > 1) {
      const newInstallments = formData.installments.filter((_, i) => i !== index);
      setFormData({ installments: newInstallments });
    }
  };

  // Open modal
  const openModal = (type, order = null) => {
    setModalType(type);
    setSelectedOrder(order);
    
    if (type === 'view' && order) {
      fetchInstallments(order.id);
    } else if (type === 'edit' && order) {
      fetchInstallments(order.id).then(() => {
        // Set form data from existing installments
        if (installments.length > 0) {
          setFormData({
            installments: installments.map(inst => ({
              due_date: inst.due_date,
              amount: inst.amount
            }))
          });
        }
      });
    } else if (type === 'create' && order) {
      // Initialize with empty installment form
      setFormData({
        installments: [{ due_date: '', amount: '' }]
      });
    }
    setModalOpen(true);
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      // If no token, redirect to login
      toast.show('Please log in to access this page', 'error');
      navigate('/login-supplier');
    }
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton type="dashboard" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text mb-2">Installment Management</h1>
          <p className="text-theme-text-secondary">
            Manage installment plans for your client orders
          </p>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-theme-border">
          <div className="px-6 py-4 border-b border-theme-border">
            <h2 className="text-lg font-semibold text-theme-text">Orders with Installments</h2>
            <p className="text-sm text-theme-text-secondary mt-1">
              View and manage installment plans for client orders
            </p>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-theme-text-muted mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-theme-text mb-2">No orders available</h3>
              <p className="text-theme-text-secondary">
                No orders are available for installment management at the moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-theme-border">
                <thead className="bg-theme-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                      Installment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-theme-border">
                  {orders.map((order) => {
                    return (
                      <tr key={order.id} className="hover:bg-theme-surface transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-theme-text">
                            #{order.order_number || order.id}
                          </div>
                          <div className="text-sm text-theme-text-secondary">
                            {order.status || 'Pending'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-theme-text">
                            {order.client?.name || order.client_name || 'Unknown Client'}
                          </div>
                          <div className="text-sm text-theme-text-secondary">
                            {order.client?.email || order.client_email || 'No email'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text">
                          ${formatCurrency(order.total_amount || order.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.has_installments ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Has Installments
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                              No Installments
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openModal('view', order)}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              View
                            </button>
                            {!order.has_installments && (
                              <button
                                onClick={() => {
                                  openModal('create', order);
                                }}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              >
                                Create Plan
                              </button>
                            )}
                            {order.has_installments && (
                              <button
                                onClick={() => openModal('edit', order)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Edit Plan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Installments Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            modalType === 'create' ? 'Create Installment Plan' :
            modalType === 'edit' ? 'Edit Installment Plan' :
            'View Installment Plan'
          }
        >
          {modalType === 'view' ? (
            <div>
              {installments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-theme-text-secondary">No installments found for this order.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-border">
                      <thead className="bg-theme-surface">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-theme-border">
                        {installments.map((installment) => (
                          <tr key={installment.id}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-theme-text">
                              {formatDate(installment.due_date)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-theme-text">
                              ${formatCurrency(installment.amount)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {getStatusBadge(installment.status, installment.due_date)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {installment.status !== 'paid' && (
                                  <button
                                    onClick={() => markAsPaid(installment.id)}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                                {installment.status !== 'overdue' && (
                                  <button
                                    onClick={() => markAsOverdue(installment.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    Mark Overdue
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-4">
                {formData.installments.map((installment, index) => (
                  <div key={index} className="flex space-x-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-theme-text mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={installment.due_date}
                        onChange={(e) => handleFormChange(index, 'due_date', e.target.value)}
                        className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-theme-text mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={installment.amount}
                        onChange={(e) => handleFormChange(index, 'amount', e.target.value)}
                        className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    {formData.installments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstallmentRow(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addInstallmentRow}
                className="w-full px-4 py-2 border-2 border-dashed border-theme-border rounded-md text-theme-text-secondary hover:text-theme-text hover:border-theme-border-dark transition-colors duration-200"
              >
                + Add Installment
              </button>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                  }}
                  className="px-4 py-2 text-theme-text-secondary hover:text-theme-text transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (modalType === 'create') {
                      createInstallmentPlan();
                    } else if (modalType === 'edit') {
                      updateInstallmentPlan();
                    }
                  }}
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : (modalType === 'create' ? 'Create Plan' : 'Update Plan')}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
} 