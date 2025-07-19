import React, { useEffect, useState } from 'react';
import { get, post, del } from '../../utils/api';
import { useToast } from '../Common/ToastContext';
import ConfirmModal from '../supplier/ConfirmModal';

const SuppliersTable = function SuppliersTable({ token }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: '', supplier: null });
  const [actionLoading, setActionLoading] = useState({});
  const toast = useToast();

  // Fetch all suppliers with pagination and filters
  const fetchSuppliers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      if (search) {
        params.append('search', search);
      }

      const res = await get(`/api/v1/suppliers?${params.toString()}`, { token });
      
      // Handle different response structures
      let suppliersArr = [];
      let pagination = {};
      
      if (res.data && Array.isArray(res.data)) {
        suppliersArr = res.data;
      } else if (res.data && res.data.data) {
        suppliersArr = res.data.data;
        pagination = res.data.pagination || {};
      } else if (res.data && res.data.suppliers) {
        suppliersArr = res.data.suppliers;
        pagination = res.data.pagination || {};
      }
      
      setSuppliers(suppliersArr);
      setTotalPages(pagination.last_page || 1);
      setTotalSuppliers(pagination.total || suppliersArr.length);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
      toast.show(err.message || 'Failed to load suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSuppliers();
  }, [token, page, perPage, statusFilter, search]);

  // Handle supplier actions
  const handleAction = async (action, supplier) => {
    setActionLoading(prev => ({ ...prev, [supplier.id]: true }));
    
    try {
      switch (action) {
        case 'approve':
          await post(`/api/v1/suppliers/${supplier.id}/approve`, { token });
          toast.show('Supplier approved successfully', 'success');
          break;
        case 'reject':
          await post(`/api/v1/suppliers/${supplier.id}/reject`, { token });
          toast.show('Supplier rejected successfully', 'success');
          break;
        case 'toggle-status':
          await post(`/api/v1/suppliers/${supplier.id}/toggle-status`, { token });
          toast.show('Supplier status toggled successfully', 'success');
          break;
        case 'verify-email':
          await post(`/api/v1/suppliers/${supplier.id}/verify-email`, { token });
          toast.show('Supplier email verified successfully', 'success');
          break;
        case 'delete':
          await del(`/api/v1/suppliers/${supplier.id}`, { token });
          toast.show('Supplier deleted successfully', 'success');
          break;
        default:
          throw new Error('Invalid action');
      }
      
      // Refresh the list after successful action
      await fetchSuppliers();
    } catch (err) {
      toast.show(err.message || `Failed to ${action} supplier`, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [supplier.id]: false }));
      setConfirmModal({ open: false, action: '', supplier: null });
    }
  };

  const openConfirmModal = (action, supplier) => {
    setConfirmModal({ open: true, action, supplier });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, action: '', supplier: null });
  };

  const getConfirmMessage = (action, supplier) => {
    switch (action) {
      case 'approve':
        return `Are you sure you want to approve ${supplier.name}?`;
      case 'reject':
        return `Are you sure you want to reject ${supplier.name}?`;
      case 'delete':
        return `Are you sure you want to delete ${supplier.name}? This action cannot be undone.`;
      case 'toggle-status':
        return `Are you sure you want to ${supplier.is_active ? 'deactivate' : 'activate'} ${supplier.name}?`;
      default:
        return 'Are you sure you want to perform this action?';
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when filtering
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-2 md:px-0">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-8 text-primary-700 flex items-center gap-2 drop-shadow-sm">
        <span className="inline-block bg-primary-100 text-primary-600 rounded-full px-2 sm:px-3 py-1 text-base sm:text-lg shadow">Suppliers</span>
        <span className="text-theme-text-secondary font-normal text-base sm:text-lg">Management</span>
      </h1>
      
      {/* Search and Filter Controls */}
      <div className="theme-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted pointer-events-none">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search suppliers by name, email, or phone..."
                className="theme-input pl-10 pr-4 py-2 w-full rounded-lg"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                aria-label="Search suppliers"
              />
            </div>
          </div>
          <select
            className="theme-input px-4 py-2 rounded-lg"
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="theme-input px-4 py-2 rounded-lg"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            aria-label="Items per page"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="theme-card p-3 sm:p-6 md:p-10">
        <div className="theme-table overflow-x-auto rounded-lg shadow-sm">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="theme-table-header text-primary-700 text-xs sm:text-base font-semibold">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Logo</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Name</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Email</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Phone</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 sm:py-12 text-theme-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-6 w-6 text-primary-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span>Loading suppliers...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 sm:py-12 text-red-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 sm:py-12 text-theme-text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <span>No suppliers found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier, idx) => (
                  <tr key={supplier.id} className={`border-b border-theme-border last:border-b-0 ${idx % 2 === 0 ? 'bg-theme-surface' : 'bg-theme-card'} hover:bg-theme-surface transition group`}>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      {supplier.logo ? (
                        <img 
                          src={supplier.logo.startsWith('http') ? supplier.logo : `https://back.twryd.com/${supplier.logo}`} 
                          alt={supplier.name} 
                          className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-full border border-theme-border shadow"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-theme-surface rounded-full flex items-center justify-center text-theme-text-muted" style={{ display: supplier.logo ? 'none' : 'flex' }}>
                        {supplier.name ? supplier.name.charAt(0).toUpperCase() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-theme-text text-xs sm:text-base">{supplier.name}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 break-all text-theme-text">{supplier.email}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-theme-text">{supplier.phone}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        supplier.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                        supplier.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        supplier.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {supplier.status === 'pending' ? 'Pending' :
                         supplier.status === 'rejected' ? 'Rejected' :
                         supplier.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 flex gap-1 sm:gap-2 flex-wrap">
                      {supplier.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => openConfirmModal('approve', supplier)} 
                            disabled={actionLoading[supplier.id]}
                            className="flex items-center gap-1 p-1 sm:p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition shadow text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-60" 
                            title="Approve"
                            aria-label="Approve supplier"
                          >
                            {actionLoading[supplier.id] ? (
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                            <span className="hidden md:inline text-xs font-semibold">Approve</span>
                          </button>
                          <button 
                            onClick={() => openConfirmModal('reject', supplier)} 
                            disabled={actionLoading[supplier.id]}
                            className="flex items-center gap-1 p-1 sm:p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition shadow text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-60" 
                            title="Reject"
                            aria-label="Reject supplier"
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span className="hidden md:inline text-xs font-semibold">Reject</span>
                          </button>
                        </>
                      )}
                      
                      {supplier.status !== 'pending' && (
                        <>
                          <button 
                            onClick={() => openConfirmModal('toggle-status', supplier)} 
                            disabled={actionLoading[supplier.id]}
                            className="flex items-center gap-1 p-1 sm:p-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-full transition shadow text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-60" 
                            title="Toggle Status"
                            aria-label="Toggle supplier status"
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                              <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span className="hidden md:inline text-xs font-semibold">Toggle</span>
                          </button>
                          <button 
                            onClick={() => handleAction('verify-email', supplier)} 
                            disabled={actionLoading[supplier.id]}
                            className="flex items-center gap-1 p-1 sm:p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition shadow text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:opacity-60" 
                            title="Verify Email"
                            aria-label="Verify supplier email"
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                              <path d="M16 12H8m4-4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span className="hidden md:inline text-xs font-semibold">Verify</span>
                          </button>
                        </>
                      )}
                      
                      <span className="w-px h-6 bg-theme-border mx-1 hidden md:inline-block" />
                      <button 
                        onClick={() => openConfirmModal('delete', supplier)} 
                        disabled={actionLoading[supplier.id]}
                        className="flex items-center gap-1 p-1 sm:p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition shadow text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-60" 
                        title="Delete"
                        aria-label="Delete supplier"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="hidden md:inline text-xs font-semibold">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-theme-text-secondary">
              Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalSuppliers)} of {totalSuppliers} suppliers
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="theme-button-secondary px-3 py-2 rounded-lg font-semibold disabled:opacity-60"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm font-semibold text-theme-text">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="theme-button px-3 py-2 rounded-lg font-semibold disabled:opacity-60"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={`${confirmModal.action.charAt(0).toUpperCase() + confirmModal.action.slice(1)} Supplier`}
        message={confirmModal.supplier ? getConfirmMessage(confirmModal.action, confirmModal.supplier) : ''}
        onConfirm={() => handleAction(confirmModal.action, confirmModal.supplier)}
        onCancel={closeConfirmModal}
        loading={actionLoading[confirmModal.supplier?.id]}
      />
    </div>
  );
};

export default React.memo(SuppliersTable); 