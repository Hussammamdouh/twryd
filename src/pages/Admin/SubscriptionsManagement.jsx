import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { get, post, put, del } from '../../utils/api';
import SubscriptionsTable from '../../UI/admin/SubscriptionsTable';
import SubscriptionFormModal from '../../UI/admin/SubscriptionFormModal';
import Pagination from '../../UI/supplier/Pagination';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import { useLayout } from '../../hooks/useLayout';

export default function SubscriptionsManagement() {
  const { token } = useAuth();
  const toast = useToast();
  const { sidebarCollapsed } = useLayout();
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSubscription, setEditSubscription] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, expired, cancelled
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [actionResult, setActionResult] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  // Fetch subscriptions
  const fetchSubscriptions = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await get(`/api/admin/subscriptions?page=${pageNum}&per_page=10`, { token });
      const data = res.data?.subscriptions?.data || res.data?.subscriptions || res.data || [];
      setSubscriptions(data);
      setTotalPages(res.data?.subscriptions?.last_page || 1);
    } catch (err) {
      console.error('Failed to load subscriptions:', err.message);
      toast.show(err.message || 'Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSubscriptions(page);
  }, [token, page]);

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(subscription => {
      const supplierName = subscription.supplier?.name || subscription.supplier?.company_name || '';
      const planName = subscription.plan?.name || '';
      const matchesSearch = !search || 
        supplierName.toLowerCase().includes(search.toLowerCase()) ||
        planName.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
        (filter === 'active' && subscription.status === 'active') ||
        (filter === 'expired' && subscription.status === 'expired') ||
        (filter === 'cancelled' && subscription.status === 'cancelled');
      
      return matchesSearch && matchesFilter;
    });
  }, [subscriptions, search, filter]);

  // Handle add subscription
  const handleAdd = () => {
    setEditSubscription(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  // Handle edit subscription
  const handleEdit = (subscription) => {
    setEditSubscription(subscription);
    setIsEdit(true);
    setModalOpen(true);
  };

  // Handle cancel subscription
  const handleCancel = async (subscription) => {
    setRowLoading(l => ({ ...l, [subscription.id]: true }));
    try {
      await post(`/api/admin/subscriptions/${subscription.id}/cancel`, { token });
      setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: true }));
      setActionResult(prev => ({ ...prev, [subscription.id]: 'success' }));
      toast.show('Subscription cancelled successfully', 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: false }));
        setActionResult(prev => ({ ...prev, [subscription.id]: undefined }));
      }, 2000);
      fetchSubscriptions(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: true }));
      setActionResult(prev => ({ ...prev, [subscription.id]: 'error' }));
      toast.show(err.message || 'Failed to cancel subscription', 'error');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: false }));
        setActionResult(prev => ({ ...prev, [subscription.id]: undefined }));
      }, 2000);
    } finally {
      setRowLoading(l => ({ ...l, [subscription.id]: false }));
    }
  };

  // Handle reactivate subscription
  const handleReactivate = async (subscription) => {
    setRowLoading(l => ({ ...l, [subscription.id]: true }));
    try {
      await post(`/api/admin/subscriptions/${subscription.id}/reactivate`, { token });
      setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: true }));
      setActionResult(prev => ({ ...prev, [subscription.id]: 'success' }));
      toast.show('Subscription reactivated successfully', 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: false }));
        setActionResult(prev => ({ ...prev, [subscription.id]: undefined }));
      }, 2000);
      fetchSubscriptions(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: true }));
      setActionResult(prev => ({ ...prev, [subscription.id]: 'error' }));
      toast.show(err.message || 'Failed to reactivate subscription', 'error');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: false }));
        setActionResult(prev => ({ ...prev, [subscription.id]: undefined }));
      }, 2000);
    } finally {
      setRowLoading(l => ({ ...l, [subscription.id]: false }));
    }
  };

  // Handle extend subscription
  const handleExtend = async (subscription, months) => {
    setRowLoading(l => ({ ...l, [subscription.id]: true }));
    try {
      await post(`/api/admin/subscriptions/${subscription.id}/extend`, {
        data: { months },
        token,
      });
      setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: true }));
      setActionResult(prev => ({ ...prev, [subscription.id]: 'success' }));
      toast.show(`Subscription extended by ${months} month(s)`, 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: false }));
        setActionResult(prev => ({ ...prev, [subscription.id]: undefined }));
      }, 2000);
      fetchSubscriptions(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: true }));
      setActionResult(prev => ({ ...prev, [subscription.id]: 'error' }));
      toast.show(err.message || 'Failed to extend subscription', 'error');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: false }));
        setActionResult(prev => ({ ...prev, [subscription.id]: undefined }));
      }, 2000);
    } finally {
      setRowLoading(l => ({ ...l, [subscription.id]: false }));
    }
  };

  // Handle form submit
  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await put(`/api/admin/subscriptions/${editSubscription.id}`, {
          data: formData,
          token,
        });
        toast.show('Subscription updated successfully', 'success');
      } else {
        await post('/api/admin/subscriptions', {
          data: formData,
          token,
        });
        toast.show('Subscription created successfully', 'success');
      }
      setModalOpen(false);
      fetchSubscriptions(page);
    } catch (err) {
      toast.show(err.message || `Failed to ${isEdit ? 'update' : 'create'} subscription`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  return (
    <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-text mb-2">Subscriptions Management</h1>
            <p className="text-theme-text-secondary">Manage supplier subscriptions and plans</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="theme-input w-full"
                  />
                </div>
                
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="theme-input min-w-[150px]"
                >
                  <option value="all">All Subscriptions</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Add Button */}
              <button
                onClick={handleAdd}
                className="theme-button px-6 py-2 font-bold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                title="Add New Subscription"
              >
                <span className="inline-block align-middle mr-2">+</span> Add Subscription
              </button>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <SubscriptionsTable
              subscriptions={filteredSubscriptions}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onReactivate={handleReactivate}
              onExtend={handleExtend}
              recentlyUpdated={recentlyUpdated}
              actionResult={actionResult}
              rowLoading={rowLoading}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}

      {/* Subscription Form Modal */}
      <SubscriptionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editSubscription}
        isEdit={isEdit}
      />
    </div>
  );
} 