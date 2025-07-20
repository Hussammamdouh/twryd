import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../UI/supplier/Sidebar';
import Topbar from '../../UI/supplier/Topbar';
import ClientDiscountsTable from '../../UI/supplier/ClientDiscountsTable';
import Pagination from '../../UI/supplier/Pagination';
import AddDiscountModal from '../../UI/supplier/AddDiscountModal';
import { useAuth } from '../../contexts/AuthContext';
import { get } from '../../utils/api';

export default function ClientDiscounts() {
  const [addDiscountOpen, setAddDiscountOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { token } = useAuth();

  // Fetch clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      // Try without pagination first, then with pagination as fallback
      let res;
      try {
        res = await get('/api/supplier/invitations/clients', { token });
      } catch {
        res = await get(`/api/supplier/invitations/clients?per_page=10&paginated=true&page=${page}`, { token });
      }
      
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
    if (token) fetchClients();
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

  return (
    <div className="min-h-screen bg-theme-bg">
      <Sidebar />
      <Topbar
        title="Client-Based Discounts"
        search={search}
        onSearch={setSearch}
        status={status}
        onStatusChange={setStatus}
        onAdd={() => setAddDiscountOpen(true)}
        addButtonText="+ Add New Discount"
        searchPlaceholder="Search by client name or email..."
      />
      <main className="pl-64 pt-20 pr-8">
        <div className="max-w-5xl mx-auto">
          <ClientDiscountsTable 
            clients={filteredClients} 
            loading={loading} 
            onAction={fetchClients} 
            onAdd={() => setAddDiscountOpen(true)} 
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