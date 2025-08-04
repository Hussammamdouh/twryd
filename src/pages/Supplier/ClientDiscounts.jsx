import React, { useState, useEffect, useMemo } from 'react';
import ClientDiscountsTable from '../../UI/supplier/ClientDiscountsTable';
import Pagination from '../../UI/supplier/Pagination';
import AddDiscountModal from '../../UI/supplier/AddDiscountModal';
import { useAuth } from '../../contexts/AuthContext';
import { get, del } from '../../utils/api';
import { useLayout } from '../../hooks/useLayout';

export default function ClientDiscounts() {
  const [addDiscountOpen, setAddDiscountOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [search, setSearch] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [status, setStatus] = useState('');
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [actionResult, setActionResult] = useState({}); // { [clientId]: 'success' | 'error' }
  const [rowLoading, setRowLoading] = useState({});
  const { token } = useAuth();
  const { sidebarCollapsed } = useLayout();

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
    <div className="min-h-screen bg-theme-bg">
      <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8 ml-0 md:ml-64">
        <div className="max-w-5xl mx-auto">
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
        </div>
      </main>
      <AddDiscountModal 
        open={addDiscountOpen} 
        onClose={() => setAddDiscountOpen(false)} 
        onSuccess={fetchClients}
        clients={clients}
      />
    </div>
  );
} 