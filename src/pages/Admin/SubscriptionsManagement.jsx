import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { get, post, put } from '../../utils/api';
import SubscriptionsTable from '../../UI/admin/SubscriptionsTable';
import SubscriptionFormModal from '../../UI/admin/SubscriptionFormModal';
import Pagination from '../../UI/supplier/Pagination';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';

export default function SubscriptionsManagement() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  
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
      toast.show(err.message || t('subscriptions.loading'), 'error');
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

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter(sub => sub.status === 'active').length;
    const expired = subscriptions.filter(sub => sub.status === 'expired').length;
    const cancelled = subscriptions.filter(sub => sub.status === 'cancelled').length;
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.price_per_month || 0), 0);
    const activeRevenue = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + (sub.price_per_month || 0), 0);

    return { total, active, expired, cancelled, totalRevenue, activeRevenue };
  }, [subscriptions]);

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
      toast.show(t('subscriptions.cancelled_success'), 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: false }));
        setActionResult(prev => ({ ...prev, [subscription.id]: undefined }));
      }, 2000);
      fetchSubscriptions(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: true }));
      setActionResult(prev => ({ ...prev, [subscription.id]: 'error' }));
      toast.show(err.message || t('messages.operation_failed'), 'error');
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
      toast.show(t('subscriptions.reactivated'), 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: false }));
        setActionResult(prev => ({ ...prev, [subscription.id]: undefined }));
      }, 2000);
      fetchSubscriptions(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: true }));
      setActionResult(prev => ({ ...prev, [subscription.id]: 'error' }));
      toast.show(err.message || t('messages.operation_failed'), 'error');
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
      toast.show(t('subscriptions.extended'), 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: false }));
        setActionResult(prev => ({ ...prev, [subscription.id]: undefined }));
      }, 2000);
      fetchSubscriptions(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [subscription.id]: true }));
      setActionResult(prev => ({ ...prev, [subscription.id]: 'error' }));
      toast.show(err.message || t('messages.operation_failed'), 'error');
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
        toast.show(t('subscriptions.updated'), 'success');
      } else {
        await post('/api/admin/subscriptions', {
          data: formData,
          token,
        });
        toast.show(t('subscriptions.created'), 'success');
      }
      setModalOpen(false);
      fetchSubscriptions(page);
    } catch (err) {
      toast.show(err.message || t('messages.operation_failed'), 'error');
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
    <div className="w-full space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{t('subscriptions.title')}</h1>
              <p className="text-green-100 text-sm sm:text-base">{t('subscriptions.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
            title="Add New Subscription"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('subscriptions.add')}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Total Subscriptions */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">{t('subscriptions.total')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{statistics.total}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">{t('subscriptions.active')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">{statistics.active}</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expired Subscriptions */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">{t('subscriptions.expired')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100">{statistics.expired}</p>
            </div>
            <div className="p-2 bg-orange-500/10 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Cancelled Subscriptions */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">{t('subscriptions.cancelled')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900 dark:text-red-100">{statistics.cancelled}</p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">{t('subscriptions.monthly_revenue')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">
                ${statistics.activeRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                {/* Search */}
            <div className="flex-1 min-w-0 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
                  <input
                    type="text"
                placeholder={t('subscriptions.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                className="theme-input w-full pl-10 pr-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  />
                </div>
                
                {/* Filter */}
            <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                className="theme-input min-w-[180px] py-3 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 appearance-none bg-white dark:bg-gray-800"
                >
                  <option value="all">{t('subscriptions.all_subscriptions')}</option>
                  <option value="active">{t('subscriptions.active')}</option>
                  <option value="expired">{t('subscriptions.expired')}</option>
                  <option value="cancelled">{t('subscriptions.cancelled')}</option>
                </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {t('subscriptions.showing', { from: filteredSubscriptions.length, to: subscriptions.length, total: subscriptions.length })}
          </div>
        </div>
      </div>

      {/* Enhanced Subscriptions Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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

      {/* Enhanced Pagination */}
          {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
            </div>
          )}

      {/* Subscription Form Modal */}
      <SubscriptionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editSubscription}
        isEdit={isEdit}
        token={token}
      />
    </div>
  );
} 