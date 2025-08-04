import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { get, patch } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Spinner from '../../UI/supplier/Spinner';
import StatusBadge from '../../UI/supplier/StatusBadge';
import ConfirmActionModal from '../../UI/supplier/ConfirmActionModal';
import Pagination from '../../UI/supplier/Pagination';

export default function SupplierOrders() {
  const { token } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, action: null });
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [actionResult, setActionResult] = useState({}); // { [orderId]: 'success' | 'error' }
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // Fetch orders
  const fetchOrders = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await get(`/api/supplier/orders?page=${pageNum}&per_page=10`, { token });
      // Assume API returns { data: { data: [...], last_page, total, ... } } or { data: [...], last_page, ... }
      const ordersData = res.data?.data || res.data?.orders?.data || res.data?.orders || res.data || [];
      setOrders(ordersData);
      setTotalPages(res.data?.last_page || res.data?.orders?.last_page || 1);
    } catch (err) {
      toast.show(err.message || 'Failed to load orders', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders(page);
    // eslint-disable-next-line
  }, [token, page]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !search || 
        order.id?.toLowerCase().includes(search.toLowerCase()) ||
        order.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
        order.client?.email?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesClient = !clientFilter || order.client_id === clientFilter;
      
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [orders, search, statusFilter, clientFilter]);

  // Get unique clients for filter
  const uniqueClients = useMemo(() => {
    const clients = orders.map(order => order.client).filter(Boolean);
    return [...new Map(clients.map(client => [client.id, client])).values()];
  }, [orders]);

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Handle order status updates
  const handleStatusUpdate = async (orderId, action, data = {}) => {
    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      let endpoint = '';
      switch (action) {
        case 'processing':
          endpoint = `/api/supplier/orders/${orderId}/processing`;
          break;
        case 'deliver':
          endpoint = `/api/supplier/orders/${orderId}/deliver`;
          break;
        case 'cancel':
          endpoint = `/api/supplier/orders/${orderId}/cancel`;
          break;
        default:
          throw new Error('Invalid action');
      }
      
      await patch(endpoint, { token, data });
      toast.show(`Order ${action} successful!`, 'success');
      setRecentlyUpdated(prev => ({ ...prev, [orderId]: true }));
      setActionResult(prev => ({ ...prev, [orderId]: 'success' }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [orderId]: false }));
        setActionResult(prev => ({ ...prev, [orderId]: undefined }));
      }, 2000);
      fetchOrders(); // Refresh orders
    } catch (err) {
      toast.show(err.message || `Failed to ${action} order`, 'error');
      setRecentlyUpdated(prev => ({ ...prev, [orderId]: true }));
      setActionResult(prev => ({ ...prev, [orderId]: 'error' }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [orderId]: false }));
        setActionResult(prev => ({ ...prev, [orderId]: undefined }));
      }, 2000);
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleActionClick = (orderId, action) => {
    if (action === 'cancel') {
      setConfirmModal({ isOpen: true, orderId, action });
    } else {
      handleStatusUpdate(orderId, action);
    }
  };

  const handleConfirmAction = () => {
    if (confirmModal.orderId && confirmModal.action) {
      handleStatusUpdate(confirmModal.orderId, confirmModal.action);
      setConfirmModal({ isOpen: false, orderId: null, action: null });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-theme-bg">
      <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-theme-text mb-2" id="orders-heading">Orders Management</h1>
              <p className="text-theme-text-secondary text-sm sm:text-base">Manage and track all client orders</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 sm:px-4 py-2">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{orders.length}</div>
                <div className="text-xs sm:text-sm text-theme-text-secondary">Total Orders</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="theme-card p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-theme-text mb-2">Search Orders</label>
                <input
                  type="text"
                  placeholder="Search by order ID, client name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-theme-text mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-theme-text mb-2">Client</label>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                >
                  <option value="">All Clients</option>
                  {uniqueClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name || client.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setClientFilter('');
                  }}
                  className="theme-button-secondary w-full py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div role="region" aria-labelledby="orders-heading">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 sm:py-16 text-theme-text-secondary">No orders found.</div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`theme-card overflow-hidden transition-colors duration-300 ${recentlyUpdated[order.id] ? (actionResult[order.id] === 'success' ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20' : 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20') : ''}`}
                    tabIndex={0}
                    aria-label={`Order #${order.order_number || order.id}`}
                  > 
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-0">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold text-theme-text">
                                Order #{order.order_number || order.id}
                              </h3>
                              <p className="text-xs sm:text-sm text-theme-text-secondary flex items-center gap-1">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 ${getStatusColor(order.status)}`} aria-label={`Order status: ${order.status || 'Unknown'}`}> 
                            {getStatusIcon(order.status)}
                            {order.status || 'Unknown'}
                          </span>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ${parseFloat(order.total || 0).toFixed(2)}
                          </div>
                          {actionLoading[order.id] && (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                          {actionResult[order.id] === 'success' && !actionLoading[order.id] && (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {actionResult[order.id] === 'error' && !actionLoading[order.id] && (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Content */}
                    <div className="p-4 sm:p-6">
                      {/* Client Information */}
                      {order.client && (
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-700">
                          <h4 className="font-semibold mb-2 sm:mb-3 text-blue-900 dark:text-blue-100 text-base sm:text-lg flex items-center gap-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Client Information
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div>
                              <span className="text-blue-700 dark:text-blue-300 font-medium">Name:</span>
                              <span className="text-blue-900 dark:text-blue-100 ml-2">{order.client.name}</span>
                            </div>
                            <div>
                              <span className="text-blue-700 dark:text-blue-300 font-medium">Email:</span>
                              <span className="text-blue-900 dark:text-blue-100 ml-2">{order.client.email}</span>
                            </div>
                            {order.client.phone && (
                              <div>
                                <span className="text-blue-700 dark:text-blue-300 font-medium">Phone:</span>
                                <span className="text-blue-900 dark:text-blue-100 ml-2">{order.client.phone}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-blue-700 dark:text-blue-300 font-medium">Client ID:</span>
                              <span className="text-blue-900 dark:text-blue-100 ml-2">{order.client_id}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Toggle Products Button */}
                      <div className="mb-4">
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm sm:text-base"
                        >
                          {expandedOrders.has(order.id) ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              Hide Products
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              Show Products
                            </>
                          )}
                        </button>
                      </div>

                      {/* Order Items - Hidden by default */}
                      {expandedOrders.has(order.id) && (
                        <div className="mb-4 sm:mb-6">
                          <h4 className="font-semibold mb-3 sm:mb-4 text-theme-text text-base sm:text-lg flex items-center gap-2" id={`order-items-heading-${order.id}`}> 
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Order Items
                          </h4>
                          <div className="space-y-3 sm:space-y-4" role="list" aria-labelledby={`order-items-heading-${order.id}`}> 
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600" tabIndex={0} aria-label={`Product: ${item.product?.name || item.name || 'Unknown Product'}, Quantity: ${item.quantity || 0}`}> 
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-theme-text text-sm sm:text-lg truncate">
                                    {item.product?.name || item.name || 'Unknown Product'}
                                  </h5>
                                  <p className="text-xs sm:text-sm text-theme-text-secondary">
                                    Qty: {item.quantity || 0} × ${parseFloat(item.unit_price || 0).toFixed(2)}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="font-bold text-sm sm:text-lg text-theme-text text-blue-600">
                                    ${parseFloat(item.total || 0).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-4 sm:pt-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <Link
                            to={`/supplier/dashboard/orders/${order.id}`}
                            className="theme-button py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg text-center flex items-center justify-center gap-2 text-sm sm:text-base"
                            aria-label={`View details for order #${order.order_number || order.id}`}
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </Link>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'processing')}
                              disabled={actionLoading[order.id]}
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 text-sm sm:text-base"
                              aria-label={`Start processing order #${order.order_number || order.id}`}
                            >
                              {actionLoading[order.id] ? (
                                <>
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  </svg>
                                  Start Processing
                                </>
                              )}
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'deliver')}
                              disabled={actionLoading[order.id]}
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 text-sm sm:text-base"
                              aria-label={`Mark order #${order.order_number || order.id} as delivered`}
                            >
                              {actionLoading[order.id] ? (
                                <>
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Marking as Delivered...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Mark as Delivered
                                </>
                              )}
                            </button>
                          )}
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <button
                              onClick={() => handleActionClick(order.id, 'cancel')}
                              disabled={actionLoading[order.id]}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 text-sm sm:text-base"
                              aria-label={`Cancel order #${order.order_number || order.id}`}
                            >
                              {actionLoading[order.id] ? (
                                <>
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Cancel Order
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </div>

          {/* Confirmation Modal */}
          <ConfirmActionModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, orderId: null, action: null })}
            onConfirm={handleConfirmAction}
            title="Cancel Order"
            message="Are you sure you want to cancel this order? This action cannot be undone."
            confirmText="Cancel Order"
            confirmColor="red"
            loading={actionLoading[confirmModal.orderId]}
          />
        </div>
      </main>
    </div>
  );
} 