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
      await post('/api/supplier/invitations/generate', {
        data: { contact, expiration_days: 7 },
        token,
      });
      setSuccess(`Invitation sent to ${contact}`);
      toast.show('Invitation sent!', 'success');
      setContact('');
      setTimeout(() => {
        setSuccess('');
        onClose();
        onSuccess?.();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
      toast.show(err.message || 'Failed to send invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleContactChange = (e) => {
    setContact(e.target.value);
    setError(validateContact(e.target.value));
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite New Client">
      {success ? (
        <div className="text-green-600 text-center font-semibold py-8">{success}</div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Client Email or Phone</label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${error ? 'border-red-400' : 'border-gray-200'}`}
              placeholder="Enter client email or phone"
              required
              value={contact}
              onChange={handleContactChange}
              disabled={loading}
              autoFocus
              tabIndex={0}
              aria-invalid={!!error}
              aria-describedby={error ? 'invite-contact-error' : undefined}
            />
            {error && <div id="invite-contact-error" className="text-red-500 text-xs mt-1" role="alert">{error}</div>}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 focus:outline-none"
              onClick={onClose}
              disabled={loading}
              tabIndex={0}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow flex items-center gap-2 focus:outline-none"
              disabled={loading}
              tabIndex={0}
            >
              {loading && <Spinner size={16} color="border-white" />}
              Send Invitation
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
} 