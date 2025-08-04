import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { put } from '../../utils/api';
import { useToast } from '../Common/ToastContext';
import Spinner from './Spinner';
import Modal from '../Common/Modal';

export default function EditProductDiscountModal({ open, discount, onClose, onSuccess }) {
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
      setError('Please enter a valid discount percentage (0-100)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await put(`/api/supplier-management/products/${discount.product.id}/clients/${discount.client.id}/default-discount`, {
        data: { default_discount: parseInt(discountValue) },
        token,
      });
      
      toast.show('Product discount updated successfully', 'success');
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to update product discount');
      toast.show(err.message || 'Failed to update product discount', 'error');
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
    <Modal open={open} onClose={handleClose} title="Edit Product Discount">
      <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">Product</label>
          <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface border border-theme-border rounded-lg text-theme-text text-sm sm:text-base">
            {discount.product?.name || 'N/A'} - {discount.product?.category?.name || 'No category'}
          </div>
        </div>
        
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">Client</label>
          <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface border border-theme-border rounded-lg text-theme-text text-sm sm:text-base">
            {discount.client?.name || discount.client?.company_name || 'N/A'} ({discount.client?.email || 'No email'})
          </div>
        </div>
        
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">Discount Percentage</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-400 ${error ? 'border-red-400' : ''}`}
            placeholder="Enter discount percentage (0-100)"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            disabled={loading}
            required
          />
          <p className="text-xs text-theme-text-muted mt-1">Enter a value between 0 and 100</p>
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
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="theme-button flex-1 py-2 sm:py-3 px-4 rounded-lg disabled:opacity-60 transition text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size={16} />
                <span>Updating...</span>
              </>
            ) : (
              'Update Discount'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
} 