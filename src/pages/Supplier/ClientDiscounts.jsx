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
    setRowLoading(l => ({ ...l, [client.id]: true }));
    try {
      await del(`/api/supplier-management/clients/${client.id}/default-discount`, { token });
      setRecentlyUpdated(prev => ({ ...prev, [client.id]: true }));
      setActionResult(prev => ({ ...prev, [client.id]: 'success' }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [client.id]: false }));
        setActionResult(prev => ({ ...prev, [client.id]: undefined }));
      }, 2000);
      fetchClients(page);
    } catch {
      setRecentlyUpdated(prev => ({ ...prev, [client.id]: true }));
      setActionResult(prev => ({ ...prev, [client.id]: 'error' }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [client.id]: false }));
        setActionResult(prev => ({ ...prev, [client.id]: undefined }));
      }, 2000);
    } finally {
      setRowLoading(l => ({ ...l, [client.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg">
      <main className={`pt-20 pr-8 transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
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
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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