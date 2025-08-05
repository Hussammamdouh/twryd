import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { put } from '../../utils/api';
import { useToast } from '../Common/ToastContext';
import Spinner from './Spinner';
import Modal from '../Common/Modal';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

export default function AddProductDiscountModal({ open, onClose, onSuccess, products, clients }) {
  const { t } = useSupplierTranslation();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [discount, setDiscount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      setError(t('product_discounts.please_select_product'));
      return;
    }
    
    if (!selectedClient) {
      setError(t('product_discounts.please_select_client'));
      return;
    }
    
    if (!discount || discount < 0 || discount > 100) {
      setError(t('product_discounts.please_enter_valid_discount'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await put(`/api/supplier-management/products/${selectedProduct}/clients/${selectedClient}/default-discount`, {
        data: { default_discount: parseInt(discount) },
        token,
      });
      
      toast.show(t('product_discounts.discount_added_successfully'), 'success');
      setSelectedProduct('');
      setSelectedClient('');
      setDiscount('');
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.message || t('product_discounts.failed_to_add_discount'));
      toast.show(err.message || t('product_discounts.failed_to_add_discount'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedProduct('');
    setSelectedClient('');
    setDiscount('');
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('product_discounts.add_new_discount_title')}>
      <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">{t('product_discounts.select_product')}</label>
          <select
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-400 ${error && !selectedProduct ? 'border-red-400' : ''}`}
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">{t('product_discounts.choose_product')}</option>
            {products?.length > 0 ? (
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.category?.name || 'No category'}
                </option>
              ))
            ) : (
              <option value="" disabled>{t('product_discounts.no_products_available')}</option>
            )}
          </select>
          {products?.length === 0 && (
            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mt-1 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              {t('product_discounts.no_products_found_message')}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">{t('product_discounts.select_client')}</label>
          <select
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-400 ${error && !selectedClient ? 'border-red-400' : ''}`}
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">{t('product_discounts.choose_client')}</option>
            {clients?.length > 0 ? (
              clients.map((client) => {
                // The actual client data is nested under the 'client' property
                const clientData = client.client || client;
                
                // Extract client name from various possible fields
                const clientName = clientData.name || clientData.company_name || 'Unknown Client';
                // Extract email from various possible fields
                const clientEmail = clientData.email || clientData.client_email || clientData.contact || 'No email';
                
                return (
                  <option value={client.id} key={client.id}>
                    {clientName} ({clientEmail})
                  </option>
                );
              })
            ) : (
              <option value="" disabled>{t('product_discounts.no_clients_available')}</option>
            )}
          </select>
          {clients?.length === 0 && (
            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mt-1 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              {t('product_discounts.no_clients_found_message')}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">{t('product_discounts.discount_percentage_label')}</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-400 ${error && (!discount || discount < 0 || discount > 100) ? 'border-red-400' : ''}`}
            placeholder={t('product_discounts.discount_percentage_placeholder')}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
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
                <span>{t('product_discounts.adding')}</span>
              </>
            ) : (
              t('product_discounts.add_discount')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
} 