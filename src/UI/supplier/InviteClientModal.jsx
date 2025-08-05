import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { post } from '../../utils/api';
import { useToast } from '../Common/ToastContext';
import Spinner from './Spinner';
import Modal from '../Common/Modal';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^01[0-9]{9}$|^\+?[0-9]{10,15}$/; // Egyptian or international

export default function InviteClientModal({ open, onClose, onSuccess }) {
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useSupplierTranslation();

  function validateContact(value) {
    if (!value) return t('invitations.contact_required');
    if (!EMAIL_REGEX.test(value) && !PHONE_REGEX.test(value)) return t('invitations.invalid_contact');
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
        throw new Error(t('invitations.invalid_contact_format'));
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
        throw new Error(t('invitations.no_invitation_token'));
      }
      setSuccess(t('invitations.invitation_generated_with_contact', { contact }));
      toast.show(t('invitations.invitation_generated'), 'success');
      setContact('');
      setTimeout(() => {
        setSuccess('');
        onClose();
        onSuccess?.();
      }, 10000);
    } catch (err) {
      setError(err.message || t('invitations.failed_to_generate'));
      toast.show(err.message || t('invitations.failed_to_generate'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('invitations.invite_new_client_title')}>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="contact-input" className="block text-sm font-medium text-theme-text mb-2">
            {t('invitations.client_contact_information')}
          </label>
          <input
            id="contact-input"
            type="text"
            className="w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 text-sm sm:text-base"
            placeholder={t('invitations.contact_placeholder')}
            value={contact}
            onChange={e => setContact(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-theme-text-secondary mt-1">
            {t('invitations.contact_help')}
          </p>
        </div>
        
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        
        {success && (
          <div className="text-green-600 dark:text-green-400 text-sm p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            {success}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
          <button 
            type="button" 
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 w-full sm:w-auto" 
            onClick={onClose} 
            disabled={loading}
          >
            {t('profile.cancel')}
          </button>
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto flex items-center justify-center gap-2" 
            disabled={loading}
          >
            {loading && <Spinner size={16} color="border-white" />}
            {loading ? t('invitations.generating') : t('invitations.generate_invitation_link')}
          </button>
        </div>
      </form>
    </Modal>
  );
} 