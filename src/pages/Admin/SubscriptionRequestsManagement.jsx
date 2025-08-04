import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { get, put } from '../../utils/api';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import SubscriptionRequestsTable from '../../UI/admin/SubscriptionRequestsTable';
import Pagination from '../../UI/supplier/Pagination';

export default function SubscriptionRequestsManagement() {
  const { token } = useAuth();
  const toast = useToast();
  
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
      toast.show('Failed to load subscription requests', 'error');
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
      toast.show('Subscription request approved successfully', 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [request.id]: false }));
        setActionResult(prev => ({ ...prev, [request.id]: undefined }));
      }, 2000);
      fetchRequests(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [request.id]: true }));
      setActionResult(prev => ({ ...prev, [request.id]: 'error' }));
      toast.show(err.message || 'Failed to approve request', 'error');
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
      toast.show('Subscription request rejected successfully', 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [request.id]: false }));
        setActionResult(prev => ({ ...prev, [request.id]: undefined }));
      }, 2000);
      fetchRequests(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [request.id]: true }));
      setActionResult(prev => ({ ...prev, [request.id]: 'error' }));
      toast.show(err.message || 'Failed to reject request', 'error');
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-theme-text mb-2">Subscription Requests</h1>
        <p className="text-theme-text-secondary">Review and manage subscription requests from suppliers</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search requests..."
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
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
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
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
} 