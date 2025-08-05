import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { put } from '../../utils/api';
import { useToast } from '../Common/ToastContext';
import Spinner from './Spinner';
import Modal from '../Common/Modal';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

export default function EditDiscountModal({ open, client, onClose, onSuccess }) {
  const { t } = useSupplierTranslation();
  const [discount, setDiscount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (client) {
      setDiscount(client.default_discount?.toString() || '');
    }
  }, [client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!discount || discount < 0 || discount > 100) {
      setError(t('client_discounts.please_enter_valid_discount'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Use the correct client ID - prefer client.client.id if it exists, otherwise use client.id
      const clientData = client.client || client;
      const clientId = clientData.id || client.id;
      
      await put(`/api/supplier-management/clients/${clientId}/default-discount`, {
        data: { default_discount: parseInt(discount) },
        token,
      });
      
      toast.show(t('client_discounts.discount_updated_successfully'), 'success');
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.message || t('client_discounts.failed_to_update_discount'));
      toast.show(err.message || t('client_discounts.failed_to_update_discount'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDiscount('');
    setError('');
    onClose();
  };

  if (!client) return null;

  // The actual client data is nested under the 'client' property
  const clientData = client.client || client;

  return (
    <Modal open={open} onClose={handleClose} title={t('client_discounts.edit_client_discount')}>
      <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">{t('client_discounts.client')}</label>
                      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface border border-theme-border rounded-lg text-theme-text text-sm sm:text-base">
              {clientData.name || clientData.company_name || 'N/A'} ({clientData.email || clientData.client_email || clientData.contact || t('client_discounts.no_email')})
            </div>
        </div>
        
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">{t('client_discounts.discount_percentage_label')}</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-400 ${error ? 'border-red-400' : ''}`}
            placeholder={t('client_discounts.discount_percentage_placeholder')}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            disabled={loading}
            required
          />
          <p className="text-xs text-theme-text-muted mt-1">{t('client_discounts.discount_percentage_help')}</p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="theme-button-secondary flex-1 py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
          >
            {t('profile.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="theme-button flex-1 py-2 sm:py-3 px-4 rounded-lg disabled:opacity-60 transition text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size={16} />
                <span>{t('client_discounts.updating')}</span>
              </>
            ) : (
              t('client_discounts.update_discount')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
} 