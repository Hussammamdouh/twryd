// This file will be the main entry for the SubscriptionsManagement tab, using modular components.
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../UI/Common/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { get, post, put } from '../../../utils/api';
import SubscriptionsPageHeader from './SubscriptionsPageHeader';
import SubscriptionsStatsCards from './SubscriptionsStatsCards';
import SubscriptionsTable from './SubscriptionsTable';
import SubscriptionFormModal from '../../../UI/admin/SubscriptionFormModal';

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
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');

  // Fetch subscriptions data
  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get('/api/admin/subscriptions', { token });
      const data = res.data?.subscriptions?.data || res.data?.subscriptions || res.data || [];
      setSubscriptions(data);
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) fetchSubscriptions();
  }, [token, fetchSubscriptions]);

  // Calculate stats
  const stats = useMemo(() => [
    {
      id: 1,
      title: t('subscriptions.stats.total'),
      value: subscriptions.length,
      change: '+15%',
      changeType: 'positive',
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
      change: '+8%',
      changeType: 'positive',
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
      change: '-5%',
      changeType: 'negative',
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
      change: '-3%',
      changeType: 'negative',
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      darkBgGradient: 'from-red-900/20 to-red-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  ], [subscriptions, t]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = subscriptions.filter(subscription => {
      const supplierName = subscription.supplier?.name || subscription.supplier?.company_name || '';
      const planName = subscription.plan?.name || '';
      const matchesSearch = supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           planName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'active' && subscription.status === 'active') ||
                           (selectedStatus === 'expired' && subscription.status === 'expired') ||
                           (selectedStatus === 'cancelled' && subscription.status === 'cancelled');
      return matchesSearch && matchesStatus;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [subscriptions, searchTerm, selectedStatus, sortBy, sortOrder]);

  // Event handlers
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

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

  const handleSubmit = useCallback(async (formData) => {
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
      fetchSubscriptions();
    } catch (err) {
      toast.show(err.message || t('messages.operation_failed'), 'error');
    }
  }, [isEdit, editSubscription, token, toast, t, fetchSubscriptions]);

  const handleAction = useCallback((action, subscription) => {
    switch (action) {
      case 'edit':
        handleEdit(subscription);
        break;
      default:
        console.log(`${action} for subscription ${subscription.id}`);
    }
  }, [handleEdit]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <SubscriptionsPageHeader onAdd={handleAdd} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Stats Cards Section */}
        <div className="mb-10 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {t('nav.subscriptions')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg max-w-2xl">
                {t('subscriptions.subtitle')}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span>{t('subscriptions.active')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>{t('subscriptions.expired')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{t('subscriptions.cancelled')}</span>
                </div>
              </div>
            </div>
          </div>
          <SubscriptionsStatsCards stats={stats} />
        </div>
        
        {/* Subscriptions Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="space-y-2">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {t('nav.subscriptions')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  {t('subscriptions.subtitle')}
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('subscriptions.showing', { from: filteredData.length, to: filteredData.length, total: subscriptions.length })}</span>
                </div>
                <button 
                  onClick={handleAdd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('subscriptions.add')}
                </button>
              </div>
            </div>
            
            <SubscriptionsTable
              data={filteredData}
              totalData={subscriptions}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onAction={handleAction}
            />
          </div>
        </div>
      </div>

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
