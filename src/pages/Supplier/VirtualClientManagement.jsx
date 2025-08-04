import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { get, post, put, del } from '../../utils/api';
import { useToast } from '../../UI/Common/ToastContext';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import Modal from '../../UI/Common/Modal';
import { useNavigate } from 'react-router-dom';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '-';
  }
};

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount) return '0.00';
  return parseFloat(amount).toFixed(2);
};

export default function VirtualClientManagement() {
  const [virtualClients, setVirtualClients] = useState([]);
  const [realClients, setRealClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'cart', 'merge'
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    phone: '',
    email: ''
  });
  const [cartFormData, setCartFormData] = useState({
    product_id: '',
    quantity: 1
  });
  const [mergeFormData, setMergeFormData] = useState({
    real_client_id: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { token, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Handle 401 errors
  const handleAuthError = (error) => {
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      toast.show('Session expired. Please log in again.', 'error');
      logout();
      navigate('/login-supplier');
    } else {
      toast.show(error.message || 'An error occurred', 'error');
    }
  };

  // Fetch virtual clients
  const fetchVirtualClients = async () => {
    try {
      setLoading(true);
      const res = await post('/api/supplier/clients', { 
        data: { action: 'list' }, 
        token 
      });
      console.log('Virtual Clients API Response:', res);
      
      const clientsData = res.data?.clients || res.data || [];
      console.log('Processed virtual clients data:', clientsData);
      
      setVirtualClients(clientsData);
    } catch (err) {
      console.error('Failed to load virtual clients:', err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real clients (for merging)
  const fetchRealClients = async () => {
    try {
      const res = await get('/api/supplier/invitations/clients', { token });
      console.log('Real Clients API Response:', res);
      
      const clientsData = res.data?.clients || res.data || [];
      console.log('Processed real clients data:', clientsData);
      
      setRealClients(clientsData);
    } catch (err) {
      console.error('Failed to load real clients:', err);
      handleAuthError(err);
    }
  };

  // Fetch products (for cart)
  const fetchProducts = async () => {
    try {
      const res = await get('/api/supplier-management/products', { token });
      console.log('Products API Response:', res);
      
      const productsData = res.data?.products || res.data || [];
      console.log('Processed products data:', productsData);
      
      setProducts(productsData);
    } catch (err) {
      console.error('Failed to load products:', err);
      handleAuthError(err);
    }
  };

  // Fetch cart items for a client
  const fetchCartItems = async (clientId) => {
    try {
      const res = await get(`/api/supplier/cart/${clientId}/items`, { token });
      console.log('Cart Items API Response:', res);
      
      const cartData = res.data?.items || res.data || [];
      console.log('Processed cart data:', cartData);
      
      setCartItems(cartData);
    } catch (err) {
      console.error('Failed to load cart items:', err);
      handleAuthError(err);
    }
  };

  // Create virtual client
  const createVirtualClient = async () => {
    try {
      setSubmitting(true);
      
      // Validate form data
      if (!formData.name || !formData.phone || !formData.email) {
        toast.show('Please fill in all required fields', 'error');
        return;
      }
      
      const res = await post('/api/supplier/clients', { 
        data: formData, 
        token 
      });
      
      if (res.success) {
        toast.show('Virtual client created successfully', 'success');
        setModalOpen(false);
        setFormData({ name: '', name_ar: '', phone: '', email: '' });
        fetchVirtualClients();
      } else {
        toast.show(res.message || 'Failed to create virtual client', 'error');
      }
    } catch (err) {
      console.error('Create virtual client error:', err);
      handleAuthError(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Add item to cart
  const addToCart = async () => {
    if (!selectedClient) return;
    
    try {
      setSubmitting(true);
      
      if (!cartFormData.product_id || !cartFormData.quantity) {
        toast.show('Please select a product and quantity', 'error');
        return;
      }
      
      const res = await post(`/api/supplier/cart/${selectedClient.id}/items`, { 
        data: cartFormData, 
        token 
      });
      
      if (res.success) {
        toast.show('Item added to cart successfully', 'success');
        setModalOpen(false);
        setCartFormData({ product_id: '', quantity: 1 });
        fetchCartItems(selectedClient.id);
      } else {
        toast.show(res.message || 'Failed to add item to cart', 'error');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      handleAuthError(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Update cart item
  const updateCartItem = async (itemId, quantity) => {
    if (!selectedClient) return;
    
    try {
      const res = await put(`/api/supplier/cart/${selectedClient.id}/items/${itemId}`, { 
        data: { quantity }, 
        token 
      });
      
      if (res.success) {
        toast.show('Cart item updated successfully', 'success');
        fetchCartItems(selectedClient.id);
      } else {
        toast.show(res.message || 'Failed to update cart item', 'error');
      }
    } catch (err) {
      console.error('Update cart item error:', err);
      handleAuthError(err);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    if (!selectedClient) return;
    
    try {
      const res = await del(`/api/supplier/cart/${selectedClient.id}/items/${itemId}`, { token });
      
      if (res.success) {
        toast.show('Item removed from cart successfully', 'success');
        fetchCartItems(selectedClient.id);
      } else {
        toast.show(res.message || 'Failed to remove item from cart', 'error');
      }
    } catch (err) {
      console.error('Remove from cart error:', err);
      handleAuthError(err);
    }
  };

  // Merge virtual client with real client
  const mergeVirtualClient = async () => {
    if (!selectedClient || !mergeFormData.real_client_id) return;
    
    try {
      setSubmitting(true);
      
      const res = await post(`/api/supplier/clients/${selectedClient.id}/merge/${mergeFormData.real_client_id}`, { 
        data: {}, 
        token 
      });
      
      if (res.success) {
        toast.show('Virtual client merged successfully', 'success');
        setModalOpen(false);
        setMergeFormData({ real_client_id: '' });
        fetchVirtualClients();
      } else {
        toast.show(res.message || 'Failed to merge virtual client', 'error');
      }
    } catch (err) {
      console.error('Merge virtual client error:', err);
      handleAuthError(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Open modal
  const openModal = (type, client = null) => {
    setModalType(type);
    setSelectedClient(client);
    
    if (type === 'cart' && client) {
      fetchCartItems(client.id);
    }
    
    setModalOpen(true);
  };

  // Handle form changes
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCartFormChange = useCallback((field, value) => {
    setCartFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMergeFormChange = useCallback((field, value) => {
    setMergeFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (token) {
      fetchVirtualClients();
      fetchRealClients();
      fetchProducts();
    } else {
      toast.show('Please log in to access this page', 'error');
      navigate('/login-supplier');
    }
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg">
        <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8 ml-0 md:ml-64">
          <div className="max-w-7xl mx-auto">
            <LoadingSkeleton type="dashboard" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg">
      <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-theme-text mb-2">Virtual Client Management</h1>
            <p className="text-theme-text-secondary text-sm sm:text-base">
              Create and manage virtual clients, their carts, and merge with real clients
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex space-x-4">
            <button
              onClick={() => openModal('create')}
              className="theme-button px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
            >
              Create Virtual Client
            </button>
          </div>

          {/* Virtual Clients Table */}
          <div className="theme-card overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-theme-border">
              <h2 className="text-lg sm:text-xl font-semibold text-theme-text">Virtual Clients</h2>
              <p className="text-sm text-theme-text-secondary mt-1">
                Manage your virtual clients and their shopping carts
              </p>
            </div>
            
            {virtualClients.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="text-theme-text-muted mb-4">
                  <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-theme-text mb-2">No virtual clients</h3>
                <p className="text-theme-text-secondary text-sm sm:text-base">
                  Create your first virtual client to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <table className="min-w-full divide-y divide-theme-border">
                    <thead className="bg-theme-surface">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Client Info
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Created Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-theme-border">
                      {virtualClients.map((client) => (
                        <tr key={client.id} className="hover:bg-theme-surface transition-colors duration-200">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-theme-text">
                              {client.name}
                            </div>
                            {client.name_ar && (
                              <div className="text-sm text-theme-text-secondary">
                                {client.name_ar}
                              </div>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-theme-text">
                              {client.email}
                            </div>
                            <div className="text-sm text-theme-text-secondary">
                              {client.phone}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">
                            {formatDate(client.created_at)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Virtual
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openModal('cart', client)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              >
                                Manage Cart
                              </button>
                              <button
                                onClick={() => openModal('merge', client)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Merge
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4 p-4">
                  {virtualClients.map((client) => (
                    <div key={client.id} className="theme-card p-4 sm:p-6">
                      {/* Client Info */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-theme-text mb-1">
                          {client.name}
                        </h3>
                        {client.name_ar && (
                          <p className="text-sm text-theme-text-secondary mb-2">
                            {client.name_ar}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-theme-text-secondary">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-theme-text-secondary mt-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{client.phone}</span>
                        </div>
                      </div>

                      {/* Status and Date */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Virtual
                        </span>
                        <div className="flex items-center gap-1 text-xs text-theme-text-secondary">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(client.created_at)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('cart', client)}
                          className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-200 text-sm font-medium"
                        >
                          Manage Cart
                        </button>
                        <button
                          onClick={() => openModal('merge', client)}
                          className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 text-sm font-medium"
                        >
                          Merge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modals */}
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title={
              modalType === 'create' ? 'Create Virtual Client' :
              modalType === 'cart' ? `Manage Cart - ${selectedClient?.name}` :
              modalType === 'merge' ? `Merge Virtual Client - ${selectedClient?.name}` :
              'Modal'
            }
          >
            {modalType === 'create' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    placeholder="Enter client name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Name (Arabic)
                  </label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => handleFormChange('name_ar', e.target.value)}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    placeholder="Enter client name in Arabic"
                    dir="rtl"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="theme-button-secondary flex-1 sm:flex-none py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={createVirtualClient}
                    disabled={submitting}
                    className="theme-button flex-1 sm:flex-none py-2 sm:py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {submitting ? 'Creating...' : 'Create Client'}
                  </button>
                </div>
              </div>
            )}

            {modalType === 'cart' && (
              <div className="space-y-4">
                {/* Add to Cart Form */}
                <div className="bg-theme-surface rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-theme-text mb-4">Add to Cart</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-2">
                        Product
                      </label>
                      <select
                        value={cartFormData.product_id}
                        onChange={(e) => handleCartFormChange('product_id', e.target.value)}
                        className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ${formatCurrency(product.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={cartFormData.quantity}
                        onChange={(e) => handleCartFormChange('quantity', parseInt(e.target.value))}
                        className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <button
                    onClick={addToCart}
                    disabled={submitting}
                    className="mt-4 w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {submitting ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>

                {/* Cart Items */}
                <div>
                  <h3 className="text-lg font-semibold text-theme-text mb-4">Cart Items</h3>
                  {cartItems.length === 0 ? (
                    <p className="text-theme-text-secondary text-center py-4">No items in cart</p>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-theme-surface rounded-lg p-3 sm:p-4 gap-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-theme-text">
                              {item.product?.name || 'Unknown Product'}
                            </div>
                            <div className="text-sm text-theme-text-secondary">
                              ${formatCurrency(item.product?.price)} each
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateCartItem(item.id, parseInt(e.target.value))}
                              className="w-16 px-2 py-1 border border-theme-border rounded text-sm"
                            />
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="theme-button-secondary px-4 py-2 rounded-lg text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {modalType === 'merge' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Merge Warning
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>
                          Merging will transfer all virtual client data (orders, cart items, etc.) to the selected real client. 
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Select Real Client to Merge With *
                  </label>
                  <select
                    value={mergeFormData.real_client_id}
                    onChange={(e) => handleMergeFormChange('real_client_id', e.target.value)}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                  >
                    <option value="">Select a real client</option>
                    {realClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.client?.name || client.name} - {client.client?.email || client.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="theme-button-secondary flex-1 sm:flex-none py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={mergeVirtualClient}
                    disabled={submitting || !mergeFormData.real_client_id}
                    className="bg-red-600 text-white flex-1 sm:flex-none py-2 sm:py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {submitting ? 'Merging...' : 'Merge Client'}
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </main>
    </div>
  );
} 