import React, { useState, useMemo, useCallback, useEffect } from 'react';
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

  // State management
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSubscription, setEditSubscription] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [rowLoading, setRowLoading] = useState({});
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [actionResult, setActionResult] = useState({});

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await get(`/api/admin/subscriptions?page=${pageNum}&per_page=10`, { token });
      const data = res.data?.subscriptions?.data || res.data?.subscriptions || res.data || [];
      setSubscriptions(data);
      setTotalPages(res.data?.subscriptions?.last_page || 1);
    } catch (err) {
      toast.show(err.message || t('subscriptions.loading'), 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast, page, t]);

  useEffect(() => {
    if (token) fetchSubscriptions(page);
  }, [token, page, fetchSubscriptions]);

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
  const stats = useMemo(() => [
    {
      id: 1,
      title: t('subscriptions.stats.total'),
      value: subscriptions.length,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBgGradient: 'from-blue-900/20 to-blue-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: 2,
      title: t('subscriptions.stats.active'),
      value: subscriptions.filter(sub => sub.status === 'active').length,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      darkBgGradient: 'from-emerald-900/20 to-emerald-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: t('subscriptions.stats.expired'),
      value: subscriptions.filter(sub => sub.status === 'expired').length,
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: 'from-orange-50 to-amber-50',
      darkBgGradient: 'from-orange-900/20 to-amber-900/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 4,
      title: t('subscriptions.stats.cancelled'),
      value: subscriptions.filter(sub => sub.status === 'cancelled').length,
      gradient: 'from-red-500 to-pink-600',
      bgGradient: 'from-red-50 to-pink-50',
      darkBgGradient: 'from-red-900/20 to-pink-900/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  ], [subscriptions, t]);

  // Event handlers
  const handleAdd = useCallback(() => {
    setEditSubscription(null);
    setIsEdit(false);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((subscription) => {
    setEditSubscription(subscription);
    setIsEdit(true);
    setModalOpen(true);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-6 sm:p-8 text-white mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{t('subscriptions.title')}</h1>
              <p className="text-blue-100 text-sm sm:text-base">{t('subscriptions.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
            title={t('subscriptions.add')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('subscriptions.add')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.id} className={`bg-gradient-to-br ${stat.bgGradient} dark:${stat.darkBgGradient} rounded-xl border p-4 sm:p-6 flex items-center gap-4`}>
            <div className="p-2 bg-white/40 rounded-lg flex-shrink-0">{stat.icon}</div>
            <div>
              <p className="text-sm font-medium mb-1">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8">
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
                className="theme-input w-full pl-10 pr-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            {/* Filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="theme-input min-w-[180px] py-3 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white dark:bg-gray-800"
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

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        <SubscriptionsTable
          subscriptions={filteredSubscriptions}
          onEdit={handleEdit}
          recentlyUpdated={recentlyUpdated}
          actionResult={actionResult}
          rowLoading={rowLoading}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mb-8">
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