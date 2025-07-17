import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { del, post } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Common/ToastContext';
import ConfirmModal from './ConfirmModal';
import Spinner from './Spinner';

export default function InvitationTable({ invitations, loading, error, onAction, onInvite }) {
  const { token } = useAuth();
  const [rowLoading, setRowLoading] = useState({});
  const [confirm, setConfirm] = useState({ open: false, type: '', inv: null });
  const toast = useToast();

  const handleAction = async (type, inv) => {
    setRowLoading(l => ({ ...l, [inv.id]: true }));
    try {
      if (type === 'cancel') {
        await del(`/api/supplier/invitations/${inv.id}`, { token });
        toast.show('Invitation cancelled', 'success');
      } else if (type === 'disconnect') {
        await post(`/api/supplier/invitations/clients/${inv.client_id}/disconnect`, { token });
        toast.show('Client disconnected', 'success');
      } else if (type === 'suspend') {
        await post(`/api/supplier/invitations/clients/${inv.client_id}/suspend`, { token });
        toast.show('Client suspended', 'success');
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
    disconnect: 'Are you sure you want to disconnect this client?',
    suspend: 'Are you sure you want to suspend this client?'
  };

  if (loading) {
    return <div className="flex justify-center py-12 text-gray-500"><Spinner size={24} /></div>;
  }
  if (error) {
    return <div className="flex justify-center py-12 text-red-500">{error}</div>;
  }
  if (!invitations || invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4">
        <div>No invitations found.</div>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow"
          onClick={onInvite}
        >
          + Invite New Client
        </button>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg shadow bg-white">
      <table className="min-w-full text-sm md:table">
        <thead>
          <tr className="bg-gray-50 text-gray-700">
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Email</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Status</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Sent Date</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((inv) => (
            <tr key={inv.id || inv.email} className="border-b last:border-0">
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">{inv.email}</td>
              <td className="px-4 md:px-6 py-4"><StatusBadge status={inv.status} /></td>
              <td className="px-4 md:px-6 py-4">{inv.sent_at || inv.sentDate}</td>
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
                  <>
                    <button
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded shadow text-xs font-bold hover:bg-blue-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      onClick={() => openConfirm('disconnect', inv)}
                      disabled={rowLoading[inv.id] || !inv.client_id}
                      tabIndex={0}
                    >
                      {rowLoading[inv.id] && <Spinner size={16} color="border-blue-700" />}
                      Disconnect
                    </button>
                    <button
                      className="px-3 py-1 bg-gray-200 text-gray-500 rounded shadow text-xs font-bold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      onClick={() => openConfirm('suspend', inv)}
                      disabled={rowLoading[inv.id] || !inv.client_id}
                      tabIndex={0}
                    >
                      Suspend
                    </button>
                  </>
                )}
                {inv.status === 'declined' && (
                  <button
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded shadow text-xs font-bold hover:bg-blue-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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