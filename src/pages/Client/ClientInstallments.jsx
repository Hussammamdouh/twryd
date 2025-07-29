import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { get } from '../../utils/api';
import { useToast } from '../../UI/Common/ToastContext';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import Modal from '../../UI/Common/Modal';

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

export default function ClientInstallments() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { token } = useAuth();
  const toast = useToast();

  // Fetch orders with installments
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await get('/api/client/installments', { token });
      
      console.log('Client Installments API Response:', res);
      
      // Handle different possible response structures
      const ordersData = res.orders || res.data?.orders || res.data || [];
      
      console.log('Processed orders data:', ordersData);
      
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load orders:', err.message);
      toast.show('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch installments for a specific order
  const fetchInstallments = async (orderId) => {
    try {
      const res = await get(`/api/client/installments/order/${orderId}`, { token });
      
      console.log('Client Installments Detail API Response:', res);
      
      // Handle different possible response structures
      const installmentsData = res.installments || res.data?.installments || res.data || [];
      
      console.log('Processed installments data:', installmentsData);
      
      setInstallments(installmentsData);
    } catch (err) {
      console.error('Failed to load installments:', err.message);
      toast.show('Failed to load installments', 'error');
    }
  };

  // Open modal to view installments
  const openModal = (order) => {
    setSelectedOrder(order);
    fetchInstallments(order.id);
    setModalOpen(true);
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    let totalOrders = orders.length;
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;

    orders.forEach(order => {
      // Add initial payment to paid amount
      paidAmount += parseFloat(order.initial_payment) || 0;
      
      if (order.installments && order.installments.length > 0) {
        order.installments.forEach(inst => {
          totalAmount += parseFloat(inst.amount) || 0;
          if (inst.status === 'paid') {
            paidAmount += parseFloat(inst.amount) || 0;
          } else if (inst.status === 'overdue' || new Date(inst.due_date) < new Date()) {
            overdueAmount += parseFloat(inst.amount) || 0;
          } else {
            pendingAmount += parseFloat(inst.amount) || 0;
          }
        });
      } else {
        // If no installments, use remaining amount for pending
        pendingAmount += parseFloat(order.remaining_amount) || 0;
      }
    });

    return {
      totalOrders,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount
    };
  }, [orders]);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

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
          <h1 className="text-3xl font-bold text-theme-text mb-2">My Installments</h1>
          <p className="text-theme-text-secondary">
            View and track your installment plans for orders
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-theme-border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-text-secondary">Total Orders</p>
                <p className="text-2xl font-bold text-theme-text">{summaryStats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-theme-border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-text-secondary">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${formatCurrency(summaryStats.paidAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-theme-border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-text-secondary">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  ${formatCurrency(summaryStats.pendingAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-theme-border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-text-secondary">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${formatCurrency(summaryStats.overdueAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-theme-border">
          <div className="px-6 py-4 border-b border-theme-border">
            <h2 className="text-lg font-semibold text-theme-text">Orders with Installments</h2>
            <p className="text-sm text-theme-text-secondary mt-1">
              View your orders that have installment plans
            </p>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-theme-text-muted mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-theme-text mb-2">No installment orders</h3>
              <p className="text-theme-text-secondary">
                You don't have any orders with installment plans at the moment.
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
                      Supplier
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
                    // Calculate installment summary for this order
                    const orderInstallments = order.installments || [];
                    const totalInstallments = orderInstallments.length;
                    const paidInstallments = orderInstallments.filter(inst => inst.status === 'paid').length;
                    const overdueInstallments = orderInstallments.filter(inst => 
                      inst.status === 'overdue' || new Date(inst.due_date) < new Date()
                    ).length;

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
                            {order.supplier?.name || `Supplier #${order.supplier_id?.slice(0, 8)}`}
                          </div>
                          <div className="text-sm text-theme-text-secondary">
                            {order.supplier?.email || 'Email not available'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text">
                          ${formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-theme-text">
                            {paidInstallments}/{totalInstallments} Paid
                          </div>
                          {overdueInstallments > 0 && (
                            <div className="text-sm text-red-600 dark:text-red-400">
                              {overdueInstallments} Overdue
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openModal(order)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            View Details
                          </button>
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
          title={`Installment Details - Order #${selectedOrder?.order_number || selectedOrder?.id}`}
        >
          {installments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-theme-text-secondary">No installments found for this order.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-theme-surface rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-theme-text mb-2">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-theme-text-secondary">Supplier:</span>
                    <span className="ml-2 text-theme-text">{selectedOrder?.supplier?.name || `Supplier #${selectedOrder?.supplier_id?.slice(0, 8)}`}</span>
                  </div>
                  <div>
                    <span className="text-theme-text-secondary">Total Amount:</span>
                    <span className="ml-2 text-theme-text">${formatCurrency(selectedOrder?.total)}</span>
                  </div>
                  <div>
                    <span className="text-theme-text-secondary">Initial Payment:</span>
                    <span className="ml-2 text-theme-text">${formatCurrency(selectedOrder?.initial_payment)}</span>
                  </div>
                  <div>
                    <span className="text-theme-text-secondary">Remaining Amount:</span>
                    <span className="ml-2 text-theme-text">${formatCurrency(selectedOrder?.remaining_amount)}</span>
                  </div>
                  <div>
                    <span className="text-theme-text-secondary">Order Date:</span>
                    <span className="ml-2 text-theme-text">{formatDate(selectedOrder?.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-theme-text-secondary">Status:</span>
                    <span className="ml-2 text-theme-text">{selectedOrder?.status || 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Installments Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-theme-border">
                  <thead className="bg-theme-surface">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                        Installment #
                      </th>
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
                        Paid Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-theme-border">
                    {installments.map((installment, index) => (
                      <tr key={installment.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-theme-text">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-theme-text">
                          {formatDate(installment.due_date)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-theme-text">
                          ${formatCurrency(installment.amount)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {getStatusBadge(installment.status, installment.due_date)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-theme-text-secondary">
                          {installment.paid_at ? formatDate(installment.paid_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-theme-surface rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${formatCurrency(installments.filter(inst => inst.status === 'paid').reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0))}
                    </div>
                    <div className="text-theme-text-secondary">Paid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      ${formatCurrency(installments.filter(inst => inst.status !== 'paid' && new Date(inst.due_date) >= new Date()).reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0))}
                    </div>
                    <div className="text-theme-text-secondary">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${formatCurrency(installments.filter(inst => inst.status === 'overdue' || new Date(inst.due_date) < new Date()).reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0))}
                    </div>
                    <div className="text-theme-text-secondary">Overdue</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
} 