import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { put } from '../../utils/api';
import { useToast } from '../Common/ToastContext';
import Spinner from './Spinner';
import Modal from '../Common/Modal';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

export default function EditProductDiscountModal({ open, discount, onClose, onSuccess }) {
  const { t } = useSupplierTranslation();
  const [discountValue, setDiscountValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (discount) {
      setDiscountValue(discount.discount?.toString() || '');
    }
  }, [discount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!discountValue || discountValue < 0 || discountValue > 100) {
      setError(t('product_discounts.please_enter_valid_discount'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await put(`/api/supplier-management/products/${discount.product.id}/clients/${discount.client.id}/default-discount`, {
        data: { default_discount: parseInt(discountValue) },
        token,
      });
      
      toast.show(t('product_discounts.discount_updated_successfully'), 'success');
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.message || t('product_discounts.failed_to_update_discount'));
      toast.show(err.message || t('product_discounts.failed_to_update_discount'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDiscountValue('');
    setError('');
    onClose();
  };

  if (!discount) return null;

  return (
    <Modal open={open} onClose={handleClose} title={t('product_discounts.edit_product_discount')}>
      <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">{t('product_discounts.product')}</label>
          <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface border border-theme-border rounded-lg text-theme-text text-sm sm:text-base">
            {discount.product?.name || 'N/A'} - {discount.product?.category?.name || t('product_discounts.no_category')}
          </div>
        </div>
        
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">{t('product_discounts.client')}</label>
          <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface border border-theme-border rounded-lg text-theme-text text-sm sm:text-base">
                          {discount.client?.name || discount.client?.company_name || 'N/A'} ({discount.client?.email || t('product_discounts.no_email')})
          </div>
        </div>
        
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">{t('product_discounts.discount_percentage_label')}</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-400 ${error ? 'border-red-400' : ''}`}
            placeholder={t('product_discounts.discount_percentage_placeholder')}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            disabled={loading}
            required
          />
          <p className="text-xs text-theme-text-muted mt-1">{t('product_discounts.discount_percentage_help')}</p>
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
                <span>{t('product_discounts.updating')}</span>
              </>
            ) : (
              t('product_discounts.update_discount')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
} 