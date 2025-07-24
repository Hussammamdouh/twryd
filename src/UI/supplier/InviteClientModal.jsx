import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { post } from '../../utils/api';
import { useToast } from '../Common/ToastContext';
import Spinner from './Spinner';
import Modal from '../Common/Modal';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^01[0-9]{9}$|^\+?[0-9]{10,15}$/; // Egyptian or international

export default function InviteClientModal({ open, onClose, onSuccess }) {
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();
  const toast = useToast();

  function validateContact(value) {
    if (!value) return 'Contact is required.';
    if (!EMAIL_REGEX.test(value) && !PHONE_REGEX.test(value)) return 'Enter a valid email or phone number.';
    return '';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const contactError = validateContact(contact);
    setError(contactError);
    if (contactError) return;
    setLoading(true);
    setSuccess('');
    try {
      let response;
      if (EMAIL_REGEX.test(contact)) {
        // Invite a specific client by email
        response = await post('/api/supplier/invitations/invite-client', {
          data: { client_email: contact, expiration_days: 7 },
          token,
        });
      } else if (PHONE_REGEX.test(contact)) {
        // Fallback: use the generic generate endpoint for phone
        response = await post('/api/supplier/invitations/generate', {
          data: { expiration_days: 7 },
          token,
        });
      } else {
        throw new Error('Invalid contact format');
      }
      // Store the contact information locally for display purposes
      if (response.data?.invitation?.id) {
        const storedInvitations = JSON.parse(localStorage.getItem('supplier_invitations') || '{}');
        storedInvitations[response.data.invitation.id] = {
          contact: contact,
          created_at: new Date().toISOString(),
          invitation_url: response.data?.invitation_url || ''
        };
        localStorage.setItem('supplier_invitations', JSON.stringify(storedInvitations));
      }
      // Generate the frontend invitation URL
      const invitationToken = response.data?.invitation?.token;
      if (!invitationToken) {
        throw new Error('No invitation token received from server');
      }
      setSuccess(`Invitation link generated successfully! Share this link with ${contact}:`);
      toast.show('Invitation link generated successfully!', 'success');
      setContact('');
      setTimeout(() => {
        setSuccess('');
        onClose();
        onSuccess?.();
      }, 10000);
    } catch (err) {
      setError(err.message || 'Failed to generate invitation');
      toast.show(err.message || 'Failed to generate invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite New Client">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
          placeholder="Enter client email or phone"
          value={contact}
          onChange={e => setContact(e.target.value)}
          disabled={loading}
        />
        {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-60" disabled={loading}>{loading ? 'Sending...' : 'Generate Invitation Link'}</button>
        </div>
        {success && <div className="text-green-600 dark:text-green-400 text-sm">{success}</div>}
      </form>
    </Modal>
  );
} 