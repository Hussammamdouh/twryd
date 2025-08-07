import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../UI/Common/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { get, put } from '../../../utils/api';
import SubscriptionRequestsPageHeader from './SubscriptionRequestsPageHeader';
import SubscriptionRequestsStatsCards from './SubscriptionRequestsStatsCards';
import SubscriptionRequestsTable from './SubscriptionRequestsTable';
import Pagination from '../../../UI/supplier/Pagination';

export default function SubscriptionRequestsManagement() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  
  // State management
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');
  
  // Action states
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [actionResult, setActionResult] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  // Fetch subscription requests
  const fetchRequests = useCallback(async (pageNum = page) => {
    setLoading(true);
    try {
      const response = await get(`/api/admin/subscription-requests?page=${pageNum}`, { token });
      const data = response.data;
      
      setRequests(data.requests?.data || data.requests || data || []);
      setTotalPages(data.requests?.last_page || data.last_page || 1);
    } catch (err) {
      console.error('Failed to fetch subscription requests:', err);
      toast.show(t('subscription_requests.loading_error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast, t, page]);

  useEffect(() => {
    if (token) fetchRequests();
  }, [token, fetchRequests]);

  // Calculate stats
  const stats = useMemo(() => [
    {
      id: 1,
      title: t('subscription_requests.stats.total'),
      value: requests.length,
      change: '+12%',
      changeType: 'positive',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBgGradient: 'from-blue-900/20 to-blue-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 2,
      title: t('subscription_requests.stats.pending'),
      value: requests.filter(request => request.status === 'pending').length,
      change: '+8%',
      changeType: 'positive',
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
      id: 3,
      title: t('subscription_requests.stats.approved'),
      value: requests.filter(request => request.status === 'approved').length,
      change: '+15%',
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
      id: 4,
      title: t('subscription_requests.stats.rejected'),
      value: requests.filter(request => request.status === 'rejected').length,
      change: '-5%',
      changeType: 'negative',
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      darkBgGradient: 'from-red-900/20 to-red-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    {
      id: 5,
      title: t('subscription_requests.stats.today'),
      value: requests.filter(request => {
        const requestDate = new Date(request.created_at);
        const todayDate = new Date();
        return requestDate.toDateString() === todayDate.toDateString();
      }).length,
      change: '+20%',
      changeType: 'positive',
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      darkBgGradient: 'from-purple-900/20 to-violet-900/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ], [requests, t]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = requests.filter(request => {
      const supplierName = request.supplier?.name || request.supplier?.company_name || '';
      const supplierEmail = request.supplier?.email || '';
      const planName = request.plan?.name || '';
      const matchesSearch = supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplierEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           planName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'supplier_name':
          aValue = (a.supplier?.name || a.supplier?.company_name || '').toLowerCase();
          bValue = (b.supplier?.name || b.supplier?.company_name || '').toLowerCase();
          break;
        case 'plan_name':
          aValue = (a.plan?.name || '').toLowerCase();
          bValue = (b.plan?.name || '').toLowerCase();
          break;
        case 'price':
          aValue = a.plan?.price_per_month || 0;
          bValue = b.plan?.price_per_month || 0;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [requests, searchTerm, selectedStatus, sortBy, sortOrder]);

  // Event handlers
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const handleApprove = useCallback(async (request) => {
    setRowLoading(l => ({ ...l, [request.id]: true }));
    try {
      await put(`/api/admin/subscription-requests/${request.id}/approve`, { token });
      setRecentlyUpdated(prev => ({ ...prev, [request.id]: true }));
      setActionResult(prev => ({ ...prev, [request.id]: 'success' }));
      toast.show(t('subscription_requests.approved_success'), 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [request.id]: false }));
        setActionResult(prev => ({ ...prev, [request.id]: undefined }));
      }, 2000);
      fetchRequests(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [request.id]: true }));
      setActionResult(prev => ({ ...prev, [request.id]: 'error' }));
      toast.show(err.message || t('messages.operation_failed'), 'error');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [request.id]: false }));
        setActionResult(prev => ({ ...prev, [request.id]: undefined }));
      }, 2000);
    } finally {
      setRowLoading(l => ({ ...l, [request.id]: false }));
    }
  }, [token, toast, t, fetchRequests, page]);

  const handleReject = useCallback(async (request) => {
    setRowLoading(l => ({ ...l, [request.id]: true }));
    try {
      await put(`/api/admin/subscription-requests/${request.id}/reject`, { token });
      setRecentlyUpdated(prev => ({ ...prev, [request.id]: true }));
      setActionResult(prev => ({ ...prev, [request.id]: 'success' }));
      toast.show(t('subscription_requests.rejected_success'), 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [request.id]: false }));
        setActionResult(prev => ({ ...prev, [request.id]: undefined }));
      }, 2000);
      fetchRequests(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [request.id]: true }));
      setActionResult(prev => ({ ...prev, [request.id]: 'error' }));
      toast.show(err.message || t('messages.operation_failed'), 'error');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [request.id]: false }));
        setActionResult(prev => ({ ...prev, [request.id]: undefined }));
      }, 2000);
    } finally {
      setRowLoading(l => ({ ...l, [request.id]: false }));
    }
  }, [token, toast, t, fetchRequests, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <SubscriptionRequestsPageHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Stats Cards Section */}
        <div className="mb-10 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {t('subscription_requests.overview_title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg max-w-2xl">
                {t('subscription_requests.overview_description')}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span>{t('subscription_requests.pending')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  <span>{t('subscription_requests.approved')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>{t('subscription_requests.rejected')}</span>
                </div>
              </div>
            </div>
          </div>
          <SubscriptionRequestsStatsCards stats={stats} />
        </div>
        
        {/* Subscription Requests Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="space-y-2">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {t('subscription_requests.management_title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  {t('subscription_requests.management_description')}
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('subscription_requests.showing', { from: filteredData.length, to: filteredData.length, total: requests.length })}</span>
                </div>
              </div>
            </div>
            
            <SubscriptionRequestsTable
              data={filteredData}
              totalData={requests}
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
              onApprove={handleApprove}
              onReject={handleReject}
              rowLoading={rowLoading}
              actionResult={actionResult}
            />
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
