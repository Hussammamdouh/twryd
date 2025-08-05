import React, { useState, useEffect, useMemo } from 'react';
import SupplierLayout from '../../layouts/SupplierLayout';
import InvitationTable from '../../UI/supplier/InvitationTable';
import Pagination from '../../UI/supplier/Pagination';
import InviteClientModal from '../../UI/supplier/InviteClientModal';
import { useAuth } from '../../contexts/AuthContext';
import { get } from '../../utils/api';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

export default function SupplierInvitations() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { token } = useAuth();
  const { t } = useSupplierTranslation();

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
    <SupplierLayout title={t('invitations.title')}>
      <div className="w-full max-w-full overflow-hidden">
        {/* Page Header with Search and Actions */}
        <div className="mb-6 space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder={t('invitations.search_placeholder')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">{t('invitations.all_statuses')}</option>
                <option value="pending">{t('invitations.pending')}</option>
                <option value="accepted">{t('invitations.accepted')}</option>
                <option value="declined">{t('invitations.declined')}</option>
                <option value="active">{t('invitations.active')}</option>
                <option value="inactive">{t('invitations.inactive')}</option>
              </select>
            </div>

            {/* Invite Button - Desktop */}
            <div className="hidden lg:block">
              <button
                onClick={() => setInviteOpen(true)}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('invitations.invite_new_client')}
              </button>
            </div>
          </div>

          {/* Invite Button - Mobile */}
          <div className="lg:hidden">
            <button
              onClick={() => setInviteOpen(true)}
              className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('invitations.invite_new_client')}
            </button>
          </div>
        </div>

        {/* Table and Pagination */}
        <div className="space-y-6 w-full max-w-full overflow-hidden">
          <InvitationTable invitations={filteredInvitations} loading={loading} onAction={fetchInvitations} onInvite={() => setInviteOpen(true)} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
      
      <InviteClientModal open={inviteOpen} onClose={() => setInviteOpen(false)} onSuccess={fetchInvitations} />
    </SupplierLayout>
  );
} 