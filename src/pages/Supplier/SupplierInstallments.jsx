import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { get, post, put, patch } from '../../utils/api';
import { useToast } from '../../UI/Common/ToastContext';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import Modal from '../../UI/Common/Modal';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../UI/supplier/StatusBadge';
import Pagination from '../../UI/supplier/Pagination';

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
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({
    installments: [
      { due_date: '', amount: '' }
    ]
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const itemsPerPage = 10;
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
      toast.show(error.message || 'An error occurred', 'error');
    }
  };

  // Fetch orders with installments
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await get('/api/supplier/orders', { token });
      
      // Handle different possible response structures
      const ordersData = res.data?.orders || res.data || [];
      
      // Process orders to add has_installments flag and normalize data
      const processedOrders = ordersData.map(order => ({
        ...order,
        // Add has_installments flag (we'll need to check this separately or assume false for now)
        has_installments: false, // This will be updated when we fetch installments
        // Normalize client data
        client_name: order.client?.name || 'Unknown Client',
        client_email: order.client?.email || 'No Email',
        // Normalize total amount
        total_amount: order.total || '0.00'
      }));
      
      setOrders(processedOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch installments for a specific order
  const fetchInstallments = async (orderId) => {
    try {
      const res = await get(`/api/supplier/installments/order/${orderId}`, { token });
      const installmentsData = res.data?.installments || res.data || [];
      setInstallments(installmentsData);
      
      // Update the has_installments flag for this order
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, has_installments: installmentsData.length > 0 }
            : order
        )
      );
    } catch (err) {
      console.error('Failed to load installments:', err);
      handleAuthError(err);
    }
  };

  // Create installment plan
  const createInstallmentPlan = async () => {
    try {
      setSubmitting(true);
      
      // Check if token exists
      if (!token) {
        toast.show('Please log in to continue', 'error');
        navigate('/login-supplier');
        return;
      }
      
      // Validate form data
      if (!formData.installments || formData.installments.length === 0) {
        toast.show('Please add at least one installment', 'error');
        return;
      }
      
      // Prepare the request data
      const requestData = {
        installments: formData.installments.map(installment => ({
          due_date: installment.due_date,
          amount: parseFloat(installment.amount)
        }))
      };
      
      // Make the API call
      const res = await post(`/api/supplier/installments/order/${selectedOrder.id}/create`, {
        data: requestData,
        token
      });
      
      if (res.success) {
        toast.show('Installment plan created successfully', 'success');
        setModalOpen(false);
        
        // Update the has_installments flag for this order
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrder.id 
              ? { ...order, has_installments: true }
              : order
          )
        );
        
        // Fetch the new installments for viewing
        fetchInstallments(selectedOrder.id);
      } else {
        toast.show(res.message || 'Failed to create installment plan', 'error');
      }
    } catch (err) {
      console.error('Failed to create installment plan:', err);
      handleAuthError(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Update installment plan
  const updateInstallmentPlan = async () => {
    try {
      setSubmitting(true);
      
      // Validate form data
      if (!formData.installments || formData.installments.length === 0) {
        toast.show('Please add at least one installment', 'error');
        return;
      }
      
      // Prepare the request data
      const requestData = {
        installments: formData.installments.map(installment => ({
          due_date: installment.due_date,
          amount: parseFloat(installment.amount)
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
        
        // Update the has_installments flag for this order
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrder.id 
              ? { ...order, has_installments: true }
              : order
          )
        );
        
        // Refresh the installments
        fetchInstallments(selectedOrder.id);
      } else {
        toast.show(res.message || 'Failed to update installment plan', 'error');
      }
    } catch (err) {
      console.error('Failed to update installment plan:', err);
      handleAuthError(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Mark installment as paid
  const markAsPaid = async (installmentId) => {
    try {
      const res = await patch(`/api/supplier/installments/installments/${installmentId}/mark-paid`, {
        token
      });
      
      if (res.success) {
        toast.show('Installment marked as paid', 'success');
        // Refresh installments
        fetchInstallments(selectedOrder.id);
      } else {
        toast.show(res.message || 'Failed to mark installment as paid', 'error');
      }
    } catch (err) {
      console.error('Failed to mark installment as paid:', err);
      handleAuthError(err);
    }
  };

  // Mark installment as overdue
  const markAsOverdue = async (installmentId) => {
    try {
      const res = await patch(`/api/supplier/installments/installments/${installmentId}/mark-overdue`, {
        token
      });
      
      if (res.success) {
        toast.show('Installment marked as overdue', 'success');
        // Refresh installments
        fetchInstallments(selectedOrder.id);
      } else {
        toast.show(res.message || 'Failed to mark installment as overdue', 'error');
      }
    } catch (err) {
      console.error('Failed to mark installment as overdue:', err);
      handleAuthError(err);
    }
  };

  // Filter orders by search, status, and client
  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id?.toString().includes(searchLower) ||
        order.client_name?.toLowerCase().includes(searchLower) ||
        order.client_email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Client filter
    if (clientFilter) {
      filtered = filtered.filter(order => order.client_name === clientFilter);
    }
    
    return filtered;
  }, [orders, searchTerm, statusFilter, clientFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique clients for filter dropdown
  const uniqueClients = useMemo(() => {
    const clients = orders.map(order => order.client_name).filter(Boolean);
    return [...new Set(clients)];
  }, [orders]);

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      fetchInstallments(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Handle form changes
  const handleFormChange = (index, field, value) => {
    const newInstallments = [...formData.installments];
    newInstallments[index] = { ...newInstallments[index], [field]: value };
    setFormData({ ...formData, installments: newInstallments });
  };

  // Add installment row
  const addInstallmentRow = () => {
    setFormData({
      ...formData,
      installments: [...formData.installments, { due_date: '', amount: '' }]
    });
  };

  // Remove installment row
  const removeInstallmentRow = (index) => {
    const newInstallments = formData.installments.filter((_, i) => i !== index);
    setFormData({ ...formData, installments: newInstallments });
  };

  // Open modal
  const openModal = (type, order = null) => {
    setModalType(type);
    setSelectedOrder(order);
    
    if (type === 'edit' && order && installments.length > 0) {
      // Set form data from existing installments
      setFormData({
        installments: installments.map(installment => ({
          due_date: installment.due_date,
          amount: installment.amount.toString()
        }))
      });
    } else {
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
      toast.show('Please log in to access this page', 'error');
      navigate('/login-supplier');
    }
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg">
        <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8 ml-0 md:ml-64">
          <div className="max-w-7xl mx-auto">
            <LoadingSkeleton type="dashboard" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg">
      <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Enhanced Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Installments Management</h1>
                  <p className="text-blue-100 text-sm sm:text-lg mt-1">Manage client payment plans and track installments</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-6 py-3 sm:py-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{orders.length}</div>
                  <div className="text-blue-100 text-xs sm:text-sm">Total Orders</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-6 py-3 sm:py-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {orders.filter(order => order.has_installments).length}
                  </div>
                  <div className="text-blue-100 text-xs sm:text-sm">With Installments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="theme-card p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <h2 className="text-lg sm:text-xl font-semibold text-theme-text">Filters & Search</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-theme-text mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Orders
                </label>
                <input
                  type="text"
                  placeholder="Order ID, client name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-theme-text mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-theme-text mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Client
                </label>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                >
                  <option value="">All Clients</option>
                  {uniqueClients.map(client => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setClientFilter('');
                  }}
                  className="theme-button-secondary w-full py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Orders List */}
          <div className="theme-card overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-theme-text flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Orders ({paginatedOrders.length})
                </h2>
                <div className="text-xs sm:text-sm text-theme-text-secondary">
                  Showing {paginatedOrders.length} of {filteredOrders.length} orders
                </div>
              </div>
            </div>
            
            {paginatedOrders.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-theme-text mb-2">No orders found</h3>
                <p className="text-theme-text-secondary max-w-md mx-auto text-sm sm:text-base">
                  Try adjusting your search criteria or filters to find the orders you're looking for.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedOrders.map((order) => (
                  <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xs sm:text-sm">
                              #{order.id?.slice(-4) || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-theme-text">
                            Order #{order.id?.slice(-8) || order.id}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p className="text-xs sm:text-sm text-theme-text-secondary">
                              {order.client_name} • {order.client_email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <StatusBadge status={order.status} />
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-bold text-theme-text">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs sm:text-sm text-theme-text-secondary">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 font-medium text-sm sm:text-base"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {expandedOrders.has(order.id) ? 'Hide Installments' : 'View Installments'}
                        </button>
                        
                        {!order.has_installments && (
                          <button
                            onClick={() => openModal('create', order)}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-200 font-medium text-sm sm:text-base"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Installment Plan
                          </button>
                        )}
                        
                        {order.has_installments && (
                          <button
                            onClick={() => openModal('edit', order)}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors duration-200 font-medium text-sm sm:text-base"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Installment Plan
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Enhanced Expanded Installments Section */}
                    {expandedOrders.has(order.id) && (
                      <div className="mt-4 sm:mt-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-3 mb-4">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h4 className="text-base sm:text-lg font-semibold text-theme-text">Installment Details</h4>
                        </div>
                        
                        {installments.length === 0 ? (
                          <div className="text-center py-6 sm:py-8">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-theme-text-secondary text-sm sm:text-base">No installments found for this order.</p>
                          </div>
                        ) : (
                          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                  <tr>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                      Due Date
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                      Amount
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                  {installments.map((installment) => (
                                    <tr key={installment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          <span className="text-sm font-medium text-theme-text">
                                            {formatDate(installment.due_date)}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                          </svg>
                                          <span className="text-sm font-semibold text-theme-text">
                                            {formatCurrency(installment.amount)}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        {getStatusBadge(installment.status, installment.due_date)}
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                          {installment.status !== 'paid' && (
                                            <button
                                              onClick={() => markAsPaid(installment.id)}
                                              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-200 text-xs sm:text-sm font-medium"
                                            >
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                              Mark Paid
                                            </button>
                                          )}
                                          {installment.status !== 'overdue' && (
                                            <button
                                              onClick={() => markAsOverdue(installment.id)}
                                              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200 text-xs sm:text-sm font-medium"
                                            >
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
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

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                              {installments.map((installment) => (
                                <div key={installment.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                  <div className="space-y-3">
                                    {/* Due Date */}
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span className="text-sm font-medium text-theme-text">
                                        {formatDate(installment.due_date)}
                                      </span>
                                    </div>
                                    
                                    {/* Amount */}
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                      </svg>
                                      <span className="text-sm font-semibold text-theme-text">
                                        {formatCurrency(installment.amount)}
                                      </span>
                                    </div>
                                    
                                    {/* Status */}
                                    <div>
                                      {getStatusBadge(installment.status, installment.due_date)}
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                      {installment.status !== 'paid' && (
                                        <button
                                          onClick={() => markAsPaid(installment.id)}
                                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-200 text-sm font-medium"
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                          Mark Paid
                                        </button>
                                      )}
                                      {installment.status !== 'overdue' && (
                                        <button
                                          onClick={() => markAsOverdue(installment.id)}
                                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200 text-sm font-medium"
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Mark Overdue
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Modal */}
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={modalType === 'create' ? 'Create Installment Plan' : 'Edit Installment Plan'}
          >
            {modalType === 'view' ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                      {installments.map((installment) => (
                        <tr key={installment.id}>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-theme-text">
                            {formatDate(installment.due_date)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-theme-text">
                            {formatCurrency(installment.amount)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(installment.status, installment.due_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-4">
                  {formData.installments.map((installment, index) => (
                    <div key={index} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-theme-text mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={installment.due_date}
                          onChange={(e) => handleFormChange(index, 'due_date', e.target.value)}
                          className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
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
                          className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      {formData.installments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInstallmentRow(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm sm:text-base"
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
                  className="w-full px-4 py-3 border-2 border-dashed border-theme-border rounded-lg text-theme-text-secondary hover:text-theme-text hover:border-theme-border-dark transition-colors duration-200 text-sm sm:text-base"
                >
                  + Add Installment
                </button>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                    }}
                    className="theme-button-secondary flex-1 sm:flex-none py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base"
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
                    className="theme-button flex-1 sm:flex-none py-2 sm:py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {submitting ? 'Saving...' : (modalType === 'create' ? 'Create Plan' : 'Update Plan')}
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </main>
    </div>
  );
} 