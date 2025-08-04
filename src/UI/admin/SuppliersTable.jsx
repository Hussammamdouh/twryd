import React, { useEffect, useState } from 'react';
import { get, post, del, put } from '../../utils/api';
import { useToast } from '../Common/ToastContext';
import ConfirmModal from '../supplier/ConfirmModal';
import SupplierFormModal from './SupplierFormModal';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const toast = useToast();
  const { t } = useLanguage();

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
      setError(err.message || t('messages.failed_to_load'));
      toast.show(err.message || t('messages.failed_to_load'), 'error');
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
          toast.show(t('suppliers.approved'), 'success');
          break;
        case 'reject':
          await post(`/api/v1/suppliers/${supplier.id}/reject`, { token });
          toast.show(t('suppliers.rejected_success'), 'success');
          break;
        case 'toggle-status':
          await post(`/api/v1/suppliers/${supplier.id}/toggle-status`, { token });
          toast.show(t('suppliers.status_toggled'), 'success');
          break;
        case 'verify-email':
          await post(`/api/v1/suppliers/${supplier.id}/verify-email`, { token });
          toast.show(t('suppliers.email_verified'), 'success');
          break;
        case 'delete':
          await del(`/api/v1/suppliers/${supplier.id}`, { token });
          toast.show(t('suppliers.deleted'), 'success');
          break;
        default:
          throw new Error('Invalid action');
      }
      
      // Refresh the list after successful action
      await fetchSuppliers();
    } catch (err) {
      toast.show(err.message || t('messages.operation_failed'), 'error');
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

  const handleAdd = () => {
    setEditSupplier(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (supplier) => {
    setEditSupplier(supplier);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleSubmit = async (form) => {
    if (isEdit) {
      try {
        const res = await put(`/api/v1/suppliers/${editSupplier.id}`, {
          token,
          data: {
            name: form.name,
            name_ar: form.name_ar,
            email: form.email,
            phone: form.phone,
            whatsapp: form.whatsapp,
            password: form.password,
            password_confirmation: form.password_confirmation,
            tax_card_number: form.tax_card_number,
            cr_number: form.cr_number,
            category_id: form.category_id,
            latitude: form.latitude,
            longitude: form.longitude,
            key_persons: form.key_persons,
            is_active: form.is_active,
          }
        });
        // Update supplier in list
        setSuppliers(suppliers => suppliers.map(s => s.id === editSupplier.id ? res.data : s));
        toast.show(t('suppliers.updated'), 'success');
      } catch (err) {
        toast.show(err.message, 'error');
      }
    } else {
      // Optimistic UI: add temp supplier
      const tempId = Date.now();
      const tempSupplier = {
        id: tempId,
        name: form.name,
        name_ar: form.name_ar,
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp,
        tax_card_number: form.tax_card_number,
        cr_number: form.cr_number,
        category_id: form.category_id,
        latitude: form.latitude,
        longitude: form.longitude,
        key_persons: form.key_persons,
        is_active: form.is_active,
      };
      setSuppliers(suppliers => [tempSupplier, ...suppliers]);
      try {
        const res = await post('/api/v1/suppliers', {
          token,
          data: {
            name: form.name,
            name_ar: form.name_ar,
            email: form.email,
            phone: form.phone,
            whatsapp: form.whatsapp,
            password: form.password,
            password_confirmation: form.password_confirmation,
            tax_card_number: form.tax_card_number,
            cr_number: form.cr_number,
            category_id: form.category_id,
            latitude: form.latitude,
            longitude: form.longitude,
            key_persons: form.key_persons,
            is_active: form.is_active,
          }
        });
        // Replace temp supplier with real one from server
        setSuppliers(suppliers => [res.data, ...suppliers.filter(s => s.id !== tempId)]);
        toast.show(t('suppliers.created'), 'success');
      } catch (err) {
        // Revert by removing the temp supplier
        setSuppliers(suppliers => suppliers.filter(s => s.id !== tempId));
        toast.show(err.message, 'error');
      }
    }
  };

  const getConfirmMessage = (action, supplier) => {
    switch (action) {
      case 'approve':
        return t('suppliers.approve_confirm', { name: supplier.name });
      case 'reject':
        return t('suppliers.reject_confirm', { name: supplier.name });
      case 'delete':
        return t('suppliers.delete_confirm', { name: supplier.name });
      case 'toggle-status':
        return t('suppliers.toggle_confirm', { 
          action: supplier.is_active ? t('suppliers.deactivate') : t('suppliers.activate'),
          name: supplier.name 
        });
      default:
        return t('messages.confirm_action');
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
        <span className="inline-block bg-primary-100 text-primary-600 rounded-full px-2 sm:px-3 py-1 text-base sm:text-lg shadow">{t('nav.suppliers')}</span>
        <span className="text-theme-text-secondary font-normal text-base sm:text-lg">{t('common.management')}</span>
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
                placeholder="Search suppliers..."
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
          <button
            onClick={handleAdd}
            className="theme-button px-4 py-2 font-bold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
            title="Add Supplier"
          >
            <span className="inline-block align-middle mr-2">+</span> Add Supplier
          </button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="theme-card p-4">
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Logo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('common.name')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('common.email')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('common.phone')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-gray-500 dark:text-gray-400">Loading suppliers...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="text-lg font-semibold text-red-500">{error}</div>
                    </div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3m10-5v4a1 1 0 001 1h3m-7 4v4m0 0H7a2 2 0 01-2-2v-5a2 2 0 012-2h10a2 2 0 012 2v5a2 2 0 01-2 2h-5z" />
                      </svg>
                      <div className="text-lg font-semibold text-gray-500 dark:text-gray-400">No suppliers found</div>
                      <p className="text-gray-400 dark:text-gray-500">No suppliers match your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr 
                    key={supplier.id} 
                    className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      {supplier.logo ? (
                        <img 
                          src={supplier.logo.startsWith('http') ? supplier.logo : `https://back.twryd.com/${supplier.logo}`} 
                          alt={supplier.name} 
                          className="w-10 h-10 object-cover rounded-full border border-gray-200 dark:border-gray-700 shadow"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm" style={{ display: supplier.logo ? 'none' : 'flex' }}>
                        {supplier.name ? supplier.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-theme-text">{supplier.name}</td>
                    <td className="px-4 py-3 text-theme-text break-all">{supplier.email}</td>
                    <td className="px-4 py-3 text-theme-text">{supplier.phone}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(supplier)} 
                          disabled={actionLoading[supplier.id]}
                          className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60" 
                          title={t('common.edit')}
                          aria-label="Edit supplier"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        
                        {supplier.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => openConfirmModal('approve', supplier)} 
                              disabled={actionLoading[supplier.id]}
                              className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 text-green-700 dark:text-green-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60" 
                              title="Approve supplier"
                              aria-label="Approve supplier"
                            >
                              {actionLoading[supplier.id] ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : (
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </button>
                            <button 
                              onClick={() => openConfirmModal('reject', supplier)} 
                              disabled={actionLoading[supplier.id]}
                              className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-60" 
                              title="Reject supplier"
                              aria-label="Reject supplier"
                            >
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </>
                        )}
                        
                        {supplier.status !== 'pending' && (
                          <>
                            <button 
                              onClick={() => openConfirmModal('toggle-status', supplier)} 
                              disabled={actionLoading[supplier.id]}
                              className="p-2 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:hover:bg-primary-800/40 text-primary-700 dark:text-primary-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-60" 
                              title="Toggle supplier status"
                              aria-label="Toggle supplier status"
                            >
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleAction('verify-email', supplier)} 
                              disabled={actionLoading[supplier.id]}
                              className="p-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/40 text-purple-700 dark:text-purple-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-60" 
                              title="Verify supplier email"
                              aria-label="Verify supplier email"
                            >
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <path d="M16 12H8m4-4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </>
                        )}
                        
                        <button 
                          onClick={() => openConfirmModal('delete', supplier)} 
                          disabled={actionLoading[supplier.id]}
                          className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-60" 
                          title={t('common.delete')}
                          aria-label="Delete supplier"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
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
              {t('suppliers.showing', { 
                from: ((page - 1) * perPage) + 1, 
                to: Math.min(page * perPage, totalSuppliers), 
                total: totalSuppliers 
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="theme-button-secondary px-3 py-2 rounded-lg font-semibold disabled:opacity-60"
                aria-label={t('common.previous')}
              >
                {t('common.previous')}
              </button>
              <span className="px-3 py-2 text-sm font-semibold text-theme-text">
                {t('suppliers.page', { current: page, total: totalPages })}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="theme-button px-3 py-2 rounded-lg font-semibold disabled:opacity-60"
                aria-label={t('common.next')}
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={`${confirmModal.action.charAt(0).toUpperCase() + confirmModal.action.slice(1)} ${t('nav.suppliers').slice(0, -1)}`}
        message={confirmModal.supplier ? getConfirmMessage(confirmModal.action, confirmModal.supplier) : ''}
        onConfirm={() => handleAction(confirmModal.action, confirmModal.supplier)}
        onCancel={closeConfirmModal}
        loading={actionLoading[confirmModal.supplier?.id]}
      />

      {/* Supplier Form Modal */}
      <SupplierFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editSupplier}
        isEdit={isEdit}
      />
    </div>
  );
};

export default React.memo(SuppliersTable); 