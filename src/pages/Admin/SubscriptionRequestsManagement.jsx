import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { get, put } from '../../utils/api';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import SubscriptionRequestsTable from '../../UI/admin/SubscriptionRequestsTable';
import Pagination from '../../UI/supplier/Pagination';

export default function SubscriptionRequestsManagement() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  
  // State
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [actionResult, setActionResult] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  // Fetch subscription requests
  const fetchRequests = async (pageNum = page) => {
    setLoading(true);
    try {
      const response = await get(`/api/admin/subscription-requests?page=${pageNum}`, { token });
      const data = response.data;
      
      setRequests(data.requests?.data || data.requests || data || []);
      setTotalPages(data.requests?.last_page || data.last_page || 1);
    } catch (err) {
      console.error('Failed to fetch subscription requests:', err);
      toast.show(t('requests.loading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(request => 
        request.supplier?.name?.toLowerCase().includes(searchLower) ||
        request.supplier?.company_name?.toLowerCase().includes(searchLower) ||
        request.supplier?.email?.toLowerCase().includes(searchLower) ||
        request.plan?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(request => request.status === filter);
    }

    return filtered;
  }, [requests, search, filter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(request => request.status === 'pending').length;
    const approved = requests.filter(request => request.status === 'approved').length;
    const rejected = requests.filter(request => request.status === 'rejected').length;
    const today = requests.filter(request => {
      const requestDate = new Date(request.created_at);
      const todayDate = new Date();
      return requestDate.toDateString() === todayDate.toDateString();
    }).length;

    return { total, pending, approved, rejected, today };
  }, [requests]);

  // Load data on mount and page change
  useEffect(() => {
    fetchRequests();
  }, [page]);

  // Handle approve request
  const handleApprove = async (request) => {
    setRowLoading(l => ({ ...l, [request.id]: true }));
    try {
      await put(`/api/admin/subscription-requests/${request.id}/approve`, { token });
      setRecentlyUpdated(prev => ({ ...prev, [request.id]: true }));
      setActionResult(prev => ({ ...prev, [request.id]: 'success' }));
      toast.show(t('requests.approved_success'), 'success');
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
  };

  // Handle reject request
  const handleReject = async (request) => {
    setRowLoading(l => ({ ...l, [request.id]: true }));
    try {
      await put(`/api/admin/subscription-requests/${request.id}/reject`, { token });
      setRecentlyUpdated(prev => ({ ...prev, [request.id]: true }));
      setActionResult(prev => ({ ...prev, [request.id]: 'success' }));
      toast.show(t('requests.rejected_success'), 'success');
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
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{t('requests.title')}</h1>
              <p className="text-orange-100 text-sm sm:text-base">{t('requests.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Total Requests */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">{t('requests.total_requests')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{statistics.total}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">{t('subscriptions.pending')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100">{statistics.pending}</p>
            </div>
            <div className="p-2 bg-orange-500/10 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Approved Requests */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">{t('subscriptions.approved')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">{statistics.approved}</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Rejected Requests */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">{t('subscriptions.rejected')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900 dark:text-red-100">{statistics.rejected}</p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        {/* Today's Requests */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">{t('requests.today')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">{statistics.today}</p>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('requests.search_placeholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
              </div>
            </div>
            
            {/* Filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none block w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              >
                <option value="all">{t('requests.all_requests')}</option>
                <option value="pending">{t('subscriptions.pending')}</option>
                <option value="approved">{t('subscriptions.approved')}</option>
                <option value="rejected">{t('subscriptions.rejected')}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <SubscriptionRequestsTable
          requests={filteredRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          recentlyUpdated={recentlyUpdated}
          actionResult={actionResult}
          rowLoading={rowLoading}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
} 