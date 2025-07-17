import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../UI/supplier/Sidebar';
import Topbar from '../../UI/supplier/Topbar';
import InvitationTable from '../../UI/supplier/InvitationTable';
import Pagination from '../../UI/supplier/Pagination';
import InviteClientModal from '../../UI/supplier/InviteClientModal';
import { useAuth } from '../../contexts/AuthContext';
import { get } from '../../utils/api';

export default function SupplierInvitations() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { token } = useAuth();

  // Refetch invitations
  const fetchInvitations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get(`/api/supplier/invitations?per_page=10&paginated=true&page=${page}`, { token });
      const data = res.data?.invitations?.data || res.data?.invitations || [];
      setInvitations(data);
      setTotalPages(res.data?.invitations?.last_page || 1);
    } catch (err) {
      setError(err.message || 'Failed to load invitations');
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
      const matchesSearch = !search || (inv.email && inv.email.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = !status || inv.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [invitations, search, status]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Sidebar />
      <Topbar
        title="Client Invitations"
        search={search}
        onSearch={setSearch}
        status={status}
        onStatusChange={setStatus}
        onInvite={() => setInviteOpen(true)}
      />
      <main className="pl-64 pt-20 pr-8">
        <div className="max-w-5xl mx-auto">
          <InvitationTable invitations={filteredInvitations} loading={loading} error={error} onAction={fetchInvitations} onInvite={() => setInviteOpen(true)} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </main>
      <InviteClientModal open={inviteOpen} onClose={() => setInviteOpen(false)} onSuccess={fetchInvitations} />
    </div>
  );
} 