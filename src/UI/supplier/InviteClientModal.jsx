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
  const [invitationUrl, setInvitationUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { token } = useAuth();
  const toast = useToast();

  function validateContact(value) {
    if (!value) return 'Contact is required.';
    if (!EMAIL_REGEX.test(value) && !PHONE_REGEX.test(value)) return 'Enter a valid email or phone number.';
    return '';
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.show('Invitation link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.show('Invitation link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const contactError = validateContact(contact);
    setError(contactError);
    if (contactError) return;
    setLoading(true);
    setSuccess('');
    try {
      // Generate invitation token (not targeted to specific client)
      const response = await post('/api/supplier/invitations/generate', {
        data: { expiration_days: 7 },
        token,
      });
      
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
      console.log('Generated invitation response:', response.data);
      console.log('Invitation token:', invitationToken);
      
      if (!invitationToken) {
        throw new Error('No invitation token received from server');
      }
      
      const frontendUrl = `${window.location.origin}/invitation/${invitationToken}`;
      console.log('Generated frontend URL:', frontendUrl);
      
      setInvitationUrl(frontendUrl);
      setSuccess(`Invitation link generated successfully! Share this link with ${contact}:`);
      toast.show('Invitation link generated successfully!', 'success');
      setContact('');
      setTimeout(() => {
        setSuccess('');
        setInvitationUrl('');
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

  const handleContactChange = (e) => {
    setContact(e.target.value);
    setError(validateContact(e.target.value));
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite New Client">
        {success ? (
          <div className="text-center py-6">
            <div className="text-green-600 font-semibold mb-4">{success}</div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">Invitation Link:</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={invitationUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(invitationUrl)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              The modal will close automatically in 10 seconds, or you can close it manually.
            </div>
          </div>
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
                Generate Invitation Link
              </button>
            </div>
          </form>
        )}
    </Modal>
  );
} 