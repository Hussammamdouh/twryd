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
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Select Product</label>
          <select
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${error && !selectedProduct ? 'border-red-400' : 'border-gray-200'}`}
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Choose a product...</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.category?.name || 'No category'}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Select Client</label>
          <select
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${error && !selectedClient ? 'border-red-400' : 'border-gray-200'}`}
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Choose a client...</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name || client.company_name || 'N/A'} ({client.email || 'No email'})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Discount Percentage</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${error && !discount ? 'border-red-400' : 'border-gray-200'}`}
              placeholder="Enter discount percentage (0-100)"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
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
            Add Discount
          </button>
        </div>
      </form>
    </Modal>
  );
} 