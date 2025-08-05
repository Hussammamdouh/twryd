import React, { useState, useEffect, useMemo } from 'react';
import SupplierLayout from '../../layouts/SupplierLayout';
import ClientDiscountsTable from '../../UI/supplier/ClientDiscountsTable';
import Pagination from '../../UI/supplier/Pagination';
import AddDiscountModal from '../../UI/supplier/AddDiscountModal';
import { useAuth } from '../../contexts/AuthContext';
import { get, del } from '../../utils/api';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

export default function ClientDiscounts() {
  const { t } = useSupplierTranslation();
  const [addDiscountOpen, setAddDiscountOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [actionResult, setActionResult] = useState({}); // { [clientId]: 'success' | 'error' }
  const [rowLoading, setRowLoading] = useState({});
  const { token } = useAuth();

  // Fetch clients
  const fetchClients = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await get(`/api/supplier/invitations/clients?per_page=10&paginated=true&page=${pageNum}`, { token });
      const data = res.data?.clients?.data || res.data?.clients || [];
      setClients(data);
      setTotalPages(res.data?.clients?.last_page || 1);
    } catch (err) {
      console.error('Failed to load clients:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchClients(page);
  }, [token, page]);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const clientName = client.name || client.company_name || '';
      const clientEmail = client.email || '';
      const matchesSearch = !search || 
        clientName.toLowerCase().includes(search.toLowerCase()) ||
        clientEmail.toLowerCase().includes(search.toLowerCase());
      
      // For status filtering, we'll check if client has active discount
      const hasActiveDiscount = client.default_discount && client.default_discount > 0;
      const matchesStatus = !status || 
        (status === 'active' && hasActiveDiscount) ||
        (status === 'inactive' && !hasActiveDiscount);
      
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, status]);

  const handleRemoveDiscount = async (client) => {
    // Use the correct client ID - prefer client.client.id if it exists, otherwise use client.id
    const clientData = client.client || client;
    const clientId = clientData.id || client.id;
    
    setRowLoading(l => ({ ...l, [clientId]: true }));
    try {
      await del(`/api/supplier-management/clients/${clientId}/default-discount`, { token });
      setRecentlyUpdated(prev => ({ ...prev, [clientId]: true }));
      setActionResult(prev => ({ ...prev, [clientId]: 'success' }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [clientId]: false }));
        setActionResult(prev => ({ ...prev, [clientId]: undefined }));
      }, 2000);
      fetchClients(page);
    } catch {
      setRecentlyUpdated(prev => ({ ...prev, [clientId]: true }));
      setActionResult(prev => ({ ...prev, [clientId]: 'error' }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [clientId]: false }));
        setActionResult(prev => ({ ...prev, [clientId]: undefined }));
      }, 2000);
    } finally {
      setRowLoading(l => ({ ...l, [clientId]: false }));
    }
  };

  return (
    <SupplierLayout title={t('client_discounts.title')}>
      {/* Page Header with Search and Actions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={t('client_discounts.search_placeholder')}
                className="w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">{t('client_discounts.all_statuses')}</option>
              <option value="active">{t('client_discounts.active')}</option>
              <option value="inactive">{t('client_discounts.inactive')}</option>
            </select>
          </div>

          {/* Add Discount Button */}
          <button
            onClick={() => setAddDiscountOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('client_discounts.add_discount')}
          </button>
        </div>
      </div>

      {/* Table and Pagination */}
      <ClientDiscountsTable 
        clients={filteredClients} 
        loading={loading} 
        onAction={fetchClients} 
        onAdd={() => setAddDiscountOpen(true)}
        onRemoveDiscount={handleRemoveDiscount}
        recentlyUpdated={recentlyUpdated}
        actionResult={actionResult}
        rowLoading={rowLoading}
      />
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
      
      <AddDiscountModal 
        open={addDiscountOpen} 
        onClose={() => setAddDiscountOpen(false)} 
        onSuccess={fetchClients}
        clients={clients}
      />
    </SupplierLayout>
  );
} 