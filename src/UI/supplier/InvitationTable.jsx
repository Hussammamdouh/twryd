import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { del, post } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Common/ToastContext';
import ConfirmModal from './ConfirmModal';
import Spinner from './Spinner';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
};

export default function InvitationTable({ invitations, loading, onAction, onInvite }) {
  const { token } = useAuth();
  const [rowLoading, setRowLoading] = useState({});
  const [confirm, setConfirm] = useState({ open: false, type: '', inv: null });
  const toast = useToast();

  // Helper function to get contact information
  const getContactInfo = (invitation) => {
    // First try to get from API response
    if (invitation.contact || invitation.email || invitation.client_email) {
      return invitation.contact || invitation.email || invitation.client_email;
    }
    
    // If not available in API, try to get from localStorage
    try {
      const storedInvitations = JSON.parse(localStorage.getItem('supplier_invitations') || '{}');
      const storedInfo = storedInvitations[invitation.id];
      if (storedInfo?.contact) {
        return storedInfo.contact;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    return 'N/A';
  };

  const handleAction = async (type, inv) => {
    setRowLoading(l => ({ ...l, [inv.id]: true }));
    try {
      if (type === 'cancel') {
        await del(`/api/supplier/invitations/${inv.id}`, { token });
        // Clean up localStorage when invitation is cancelled
        try {
          const storedInvitations = JSON.parse(localStorage.getItem('supplier_invitations') || '{}');
          delete storedInvitations[inv.id];
          localStorage.setItem('supplier_invitations', JSON.stringify(storedInvitations));
        } catch (error) {
          console.error('Error cleaning up localStorage:', error);
        }
        toast.show('Invitation cancelled', 'success');
      } else if (type === 'suspend') {
        await post(`/api/supplier/invitations/clients/${inv.client_id}/suspend`, { token });
        toast.show('Client suspended', 'success');
      } else if (type === 'reactivate') {
        await post(`/api/supplier/invitations/clients/${inv.client_id}/reactivate`, { token });
        toast.show('Client reactivated', 'success');
      } else if (type === 'resend') {
        toast.show('Resend not implemented in API', 'info');
      }
      onAction?.();
    } catch (err) {
      toast.show(err.message || 'Action failed', 'error');
    } finally {
      setRowLoading(l => ({ ...l, [inv.id]: false }));
      setConfirm({ open: false, type: '', inv: null });
    }
  };

  const openConfirm = (type, inv) => setConfirm({ open: true, type, inv });
  const closeConfirm = () => setConfirm({ open: false, type: '', inv: null });
  const confirmMessage = {
    cancel: 'Are you sure you want to cancel this invitation?',
    suspend: 'Are you sure you want to suspend this client?',
    reactivate: 'Are you sure you want to reactivate this client?'
  };

  if (loading) {
    return <div className="flex justify-center py-12 text-theme-text-secondary"><Spinner size={24} /></div>;
  }
  if (!invitations || invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-theme-text-muted gap-4">
        <div>No invitations found.</div>
        <button
          className="theme-button px-4 py-2 rounded-lg font-bold shadow"
          onClick={onInvite}
        >
          + Invite New Client
        </button>
      </div>
    );
  }
  return (
    <div className="theme-table overflow-x-auto rounded-lg shadow">
      <table className="min-w-full text-sm md:table">
        <thead>
          <tr className="theme-table-header text-theme-text">
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Email</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Status</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Sent Date</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((inv) => (
            <tr key={inv.id || inv.email} className="border-b border-theme-border last:border-0">
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-theme-text">
                {getContactInfo(inv)}
              </td>
              <td className="px-4 md:px-6 py-4"><StatusBadge status={inv.status} /></td>
              <td className="px-4 md:px-6 py-4 text-theme-text">
                {formatDate(inv.created_at || inv.sent_at || inv.sentDate)}
              </td>
              <td className="px-4 md:px-6 py-4 flex flex-wrap gap-2">
                {inv.status === 'pending' && (
                  <button
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded shadow text-xs font-bold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    onClick={() => openConfirm('cancel', inv)}
                    disabled={rowLoading[inv.id]}
                    tabIndex={0}
                  >
                    {rowLoading[inv.id] && <Spinner size={16} color="border-white" />}
                    Cancel
                  </button>
                )}
                {inv.status === 'accepted' && (
                  <button
                    className={`px-3 py-1 rounded shadow text-xs font-bold flex items-center gap-2 focus:outline-none focus:ring-2 ${
                      inv.relationship_status === 'suspended' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-400 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200 focus:ring-orange-400 dark:bg-orange-900/30 dark:text-orange-300'
                    }`}
                    onClick={() => openConfirm(inv.relationship_status === 'suspended' ? 'reactivate' : 'suspend', inv)}
                    disabled={rowLoading[inv.id] || !inv.client_id}
                    tabIndex={0}
                  >
                    {rowLoading[inv.id] && <Spinner size={16} color="border-current" />}
                    {inv.relationship_status === 'suspended' ? 'Reactivate' : 'Suspend'}
                  </button>
                )}
                {inv.status === 'declined' && (
                  <button
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded shadow text-xs font-bold hover:bg-primary-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-primary-900/30 dark:text-primary-300"
                    onClick={() => handleAction('resend', inv)}
                    disabled={rowLoading[inv.id]}
                    tabIndex={0}
                  >
                    Resend
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmModal
        open={confirm.open}
        title={confirm.type.charAt(0).toUpperCase() + confirm.type.slice(1) + ' Confirmation'}
        message={confirmMessage[confirm.type]}
        onConfirm={() => handleAction(confirm.type, confirm.inv)}
        onCancel={closeConfirm}
        loading={rowLoading[confirm.inv?.id]}
      />
    </div>
  );
} 