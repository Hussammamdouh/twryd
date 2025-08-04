import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../UI/supplier/Sidebar';
import Topbar from '../../UI/supplier/Topbar';
import InvitationTable from '../../UI/supplier/InvitationTable';
import Pagination from '../../UI/supplier/Pagination';
import InviteClientModal from '../../UI/supplier/InviteClientModal';
import { useAuth } from '../../contexts/AuthContext';
import { get } from '../../utils/api';
import { useLayout } from '../../hooks/useLayout';

export default function SupplierInvitations() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [search, setSearch] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [status, setStatus] = useState('');
  const { token } = useAuth();
  const { sidebarCollapsed } = useLayout();

  // Refetch invitations
  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await get(`/api/supplier/invitations?per_page=10&paginated=true&page=${page}`, { token });
      const data = res.data?.invitations?.data || res.data?.invitations || [];
      setInvitations(data);
      setTotalPages(res.data?.invitations?.last_page || 1);
    } catch (err) {
      console.error('Failed to load invitations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchInvitations();
  }, [token, page]);

  // Restore filteredInvitations useMemo and its usage
  const filteredInvitations = useMemo(() => {
    return invitations.filter(inv => {
      // Use the same logic as the table to get contact info
      let contact = '';
      if (inv.contact || inv.email || inv.client_email) {
        contact = inv.contact || inv.email || inv.client_email;
      } else {
        try {
          const storedInvitations = JSON.parse(localStorage.getItem('supplier_invitations') || '{}');
          const storedInfo = storedInvitations[inv.id];
          contact = storedInfo?.contact || '';
        } catch (error) {
          console.error('Error reading from localStorage:', error);
        }
      }
      
      const matchesSearch = !search || contact.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !status || inv.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [invitations, search, status]);

  return (
    <div className="min-h-screen bg-theme-bg">
      <Sidebar />
      <Topbar
        title="Client Invitations"
        search={search}
        onSearch={setSearch}
        status={status}
        onStatusChange={setStatus}
        onInvite={() => setInviteOpen(true)}
      />
      <main className={`pt-16 md:pt-20 px-4 sm:px-8 pb-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'}`}>
        <div className="max-w-5xl mx-auto">
          <InvitationTable invitations={filteredInvitations} loading={loading} onAction={fetchInvitations} onInvite={() => setInviteOpen(true)} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </main>
      <InviteClientModal open={inviteOpen} onClose={() => setInviteOpen(false)} onSuccess={fetchInvitations} />
    </div>
  );
} 