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
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Product</label>
          <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
            {discount.product?.name || 'N/A'} - {discount.product?.category?.name || 'No category'}
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Client</label>
          <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
            {discount.client?.name || discount.client?.company_name || 'N/A'} ({discount.client?.email || 'No email'})
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Discount Percentage</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${error ? 'border-red-400' : 'border-gray-200'}`}
              placeholder="Enter discount percentage (0-100)"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              disabled={loading}
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 text-sm">%</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm" role="alert">
            {error}
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 focus:outline-none"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow flex items-center gap-2 focus:outline-none"
            disabled={loading}
          >
            {loading && <Spinner size={16} color="border-white" />}
            Update Discount
          </button>
        </div>
      </form>
    </Modal>
  );
} 