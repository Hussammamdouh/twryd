import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { del, post } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Common/ToastContext';
import ConfirmModal from './ConfirmModal';
import Spinner from './Spinner';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

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
  const { t } = useSupplierTranslation();

  // Helper function to get contact information
  const getContactInfo = (invitation) => {
    // Debug: Log the invitation object to see its structure
    console.log('Invitation object:', invitation);
    
    // Check all possible email field names in order of preference
    if (invitation.client_email) return invitation.client_email;
    if (invitation.email) return invitation.email;
    if (invitation.contact) return invitation.contact;
    if (invitation.client?.email) return invitation.client.email;
    if (invitation.client?.contact) return invitation.client.contact;
    if (invitation.user?.email) return invitation.user.email;
    
    // Fallback to localStorage
    try {
      const storedInvitations = JSON.parse(localStorage.getItem('supplier_invitations') || '{}');
      const storedInfo = storedInvitations[invitation.id];
      if (storedInfo?.contact) {
        return storedInfo.contact;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    // If still no email found, return a more descriptive message
    return t('invitations.email_not_available');
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
        toast.show(t('invitations.invitation_cancelled'), 'success');
      } else if (type === 'suspend') {
        await post(`/api/supplier/invitations/clients/${inv.client_id}/suspend`, { token });
        toast.show(t('invitations.client_suspended'), 'success');
      } else if (type === 'reactivate') {
        await post(`/api/supplier/invitations/clients/${inv.client_id}/reactivate`, { token });
        toast.show(t('invitations.client_reactivated'), 'success');
      } else if (type === 'resend') {
        toast.show(t('invitations.resend_not_implemented'), 'info');
      }
      onAction?.();
    } catch (err) {
      toast.show(err.message || t('invitations.action_failed'), 'error');
    } finally {
      setRowLoading(l => ({ ...l, [inv.id]: false }));
      setConfirm({ open: false, type: '', inv: null });
    }
  };

  const openConfirm = (type, inv) => setConfirm({ open: true, type, inv });
  const closeConfirm = () => setConfirm({ open: false, type: '', inv: null });
  const confirmMessage = {
    cancel: t('invitations.cancel_confirmation'),
    suspend: t('invitations.suspend_confirmation'),
    reactivate: t('invitations.reactivate_confirmation')
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8 sm:py-12 text-theme-text-secondary">
        <Spinner size={24} />
      </div>
    );
  }
  
  if (!invitations || invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-theme-text-muted gap-4 px-4">
        <div className="text-center">
          <div className="text-lg sm:text-xl font-medium mb-2">{t('invitations.no_invitations_found')}</div>
          <p className="text-sm text-theme-text-secondary mb-4">{t('invitations.no_invitations_message')}</p>
        </div>
        <button
          className="theme-button px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold shadow w-full sm:w-auto"
          onClick={onInvite}
        >
          {t('invitations.invite_new_client')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Invite Button - Only show on mobile when there are invitations */}
      <div className="md:hidden">
        <button
          className="theme-button px-4 py-3 rounded-lg font-bold shadow w-full flex items-center justify-center gap-2"
          onClick={onInvite}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('invitations.invite_new_client')}
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block theme-table overflow-x-auto rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="theme-table-header text-theme-text">
              <th className="px-4 md:px-6 py-3 text-left font-semibold">{t('invitations.email')}</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold">{t('invitations.status')}</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold">{t('invitations.sent_date')}</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold">{t('invitations.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => (
              <tr key={inv.id || inv.email} className="border-b border-theme-border last:border-0 hover:bg-primary-50 dark:hover:bg-primary-900/10">
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
                      {t('invitations.cancel')}
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
                      {inv.relationship_status === 'suspended' ? t('invitations.reactivate') : t('invitations.suspend')}
                    </button>
                  )}
                  {inv.status === 'declined' && (
                    <button
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded shadow text-xs font-bold hover:bg-primary-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-primary-900/30 dark:text-primary-300"
                      onClick={() => handleAction('resend', inv)}
                      disabled={rowLoading[inv.id]}
                      tabIndex={0}
                    >
                      {t('invitations.resend')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {invitations.map((inv) => (
          <div key={inv.id || inv.email} className="theme-card p-4 sm:p-6">
            <div className="space-y-3">
              {/* Email */}
              <div>
                <div className="text-xs font-medium text-theme-text-secondary mb-1">{t('invitations.email')}</div>
                <div className="text-sm font-medium text-theme-text break-all">
                  {getContactInfo(inv)}
                </div>
              </div>

              {/* Status and Date Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-xs font-medium text-theme-text-secondary mb-1">{t('invitations.status')}</div>
                  <StatusBadge status={inv.status} />
                </div>
                <div>
                  <div className="text-xs font-medium text-theme-text-secondary mb-1">{t('invitations.sent_date')}</div>
                  <div className="text-sm text-theme-text">
                    {formatDate(inv.created_at || inv.sent_at || inv.sentDate)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-theme-border">
                <div className="text-xs font-medium text-theme-text-secondary mb-2">{t('invitations.actions')}</div>
                <div className="flex flex-wrap gap-2">
                  {inv.status === 'pending' && (
                    <button
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow text-sm font-bold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400 w-full sm:w-auto justify-center"
                      onClick={() => openConfirm('cancel', inv)}
                      disabled={rowLoading[inv.id]}
                      tabIndex={0}
                    >
                      {rowLoading[inv.id] && <Spinner size={16} color="border-white" />}
                      {t('invitations.cancel_invitation')}
                    </button>
                  )}
                  {inv.status === 'accepted' && (
                    <button
                      className={`px-3 py-2 rounded-lg shadow text-sm font-bold flex items-center gap-2 focus:outline-none focus:ring-2 w-full sm:w-auto justify-center ${
                        inv.relationship_status === 'suspended' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-400 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200 focus:ring-orange-400 dark:bg-orange-900/30 dark:text-orange-300'
                      }`}
                      onClick={() => openConfirm(inv.relationship_status === 'suspended' ? 'reactivate' : 'suspend', inv)}
                      disabled={rowLoading[inv.id] || !inv.client_id}
                      tabIndex={0}
                    >
                      {rowLoading[inv.id] && <Spinner size={16} color="border-current" />}
                      {inv.relationship_status === 'suspended' ? t('invitations.reactivate_client') : t('invitations.suspend_client')}
                    </button>
                  )}
                  {inv.status === 'declined' && (
                    <button
                      className="px-3 py-2 bg-primary-100 text-primary-700 rounded-lg shadow text-sm font-bold hover:bg-primary-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-primary-900/30 dark:text-primary-300 w-full sm:w-auto justify-center"
                      onClick={() => handleAction('resend', inv)}
                      disabled={rowLoading[inv.id]}
                      tabIndex={0}
                    >
                      {t('invitations.resend_invitation')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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