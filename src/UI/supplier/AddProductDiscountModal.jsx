import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { put } from '../../utils/api';
import { useToast } from '../Common/ToastContext';
import Spinner from './Spinner';
import Modal from '../Common/Modal';

export default function AddProductDiscountModal({ open, onClose, onSuccess, products, clients }) {
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
      setError('Please select a product');
      return;
    }
    
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }
    
    if (!discount || discount < 0 || discount > 100) {
      setError('Please enter a valid discount percentage (0-100)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await put(`/api/supplier-management/products/${selectedProduct}/clients/${selectedClient}/default-discount`, {
        data: { default_discount: parseInt(discount) },
        token,
      });
      
      toast.show('Product discount added successfully', 'success');
      setSelectedProduct('');
      setSelectedClient('');
      setDiscount('');
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to add product discount');
      toast.show(err.message || 'Failed to add product discount', 'error');
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
    <Modal open={open} onClose={handleClose} title="Add Product Discount">
      <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">Select Product</label>
          <select
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-400 ${error && !selectedProduct ? 'border-red-400' : ''}`}
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Choose a product...</option>
            {products?.length > 0 ? (
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.category?.name || 'No category'}
                </option>
              ))
            ) : (
              <option value="" disabled>No products available</option>
            )}
          </select>
          {products?.length === 0 && (
            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mt-1 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              No products found. Please create products first.
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">Select Client</label>
          <select
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-400 ${error && !selectedClient ? 'border-red-400' : ''}`}
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Choose a client...</option>
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
              <option value="" disabled>No clients available</option>
            )}
          </select>
          {clients?.length === 0 && (
            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mt-1 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              No clients found. Please invite clients first.
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-theme-text mb-2 font-medium text-sm">Discount Percentage</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-400 ${error && (!discount || discount < 0 || discount > 100) ? 'border-red-400' : ''}`}
            placeholder="Enter discount percentage (0-100)"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
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
                <span>Adding...</span>
              </>
            ) : (
              'Add Discount'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
} 