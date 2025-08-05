import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { get, post, put, del } from '../../utils/api';
import { useToast } from '../../UI/Common/ToastContext';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import Modal from '../../UI/Common/Modal';
import { useNavigate } from 'react-router-dom';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

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

// Memoized Virtual Client Row Component
const VirtualClientRow = React.memo(({ client, onManageCart, onMerge }) => {
  const { t } = useSupplierTranslation();
  
  const handleManageCart = useCallback(() => {
    onManageCart(client);
  }, [client, onManageCart]);

  const handleMerge = useCallback(() => {
    onMerge(client);
  }, [client, onMerge]);

  return (
    <tr className="hover:bg-theme-surface transition-colors duration-200">
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
          {t('virtual_clients.virtual')}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={handleManageCart}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
          >
            {t('virtual_clients.manage_cart')}
          </button>
          <button
            onClick={handleMerge}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t('virtual_clients.merge')}
          </button>
        </div>
      </td>
    </tr>
  );
});

// Memoized Mobile Client Card Component
const MobileClientCard = React.memo(({ client, onManageCart, onMerge }) => {
  const { t } = useSupplierTranslation();
  
  const handleManageCart = useCallback(() => {
    onManageCart(client);
  }, [client, onManageCart]);

  const handleMerge = useCallback(() => {
    onMerge(client);
  }, [client, onMerge]);

  return (
    <div className="theme-card p-4 sm:p-6">
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
          {t('virtual_clients.virtual')}
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
          onClick={handleManageCart}
          className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-200 text-sm font-medium"
        >
          {t('virtual_clients.manage_cart')}
        </button>
        <button
          onClick={handleMerge}
          className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 text-sm font-medium"
        >
          {t('virtual_clients.merge')}
        </button>
      </div>
    </div>
  );
});

// Memoized Cart Item Component
const CartItem = React.memo(({ item, onUpdateQuantity, onRemove }) => {
  const { t } = useSupplierTranslation();
  
  const handleQuantityChange = useCallback((e) => {
    onUpdateQuantity(item.id, parseInt(e.target.value));
  }, [item.id, onUpdateQuantity]);

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-theme-surface rounded-lg p-3 sm:p-4 gap-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-theme-text">
          {item.product?.name || t('virtual_clients.unknown_product')}
        </div>
        <div className="text-sm text-theme-text-secondary">
          ${formatCurrency(item.product?.price)} {t('virtual_clients.each')}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="w-16 px-2 py-1 border border-theme-border rounded text-sm"
        />
        <button
          onClick={handleRemove}
          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          {t('virtual_clients.remove')}
        </button>
      </div>
    </div>
  );
});

export default function VirtualClientManagement() {
  const { t } = useSupplierTranslation();
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

  // Performance: Memoize handlers
  const handleAuthError = useCallback((error) => {
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      toast.show(t('virtual_clients.session_expired'), 'error');
      logout();
      navigate('/login-supplier');
    } else {
      toast.show(error.message || 'An error occurred', 'error');
    }
  }, [toast, t, logout, navigate]);

  // Performance: Memoize API calls
  const fetchVirtualClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await get('/api/supplier/clients', { token });
      console.log('Virtual Clients API Response:', res);
      
      // Handle both old format (res.data.clients) and new paginated format (res.data.data)
      const clientsData = res.data?.clients || res.data?.data || res.data || [];
      console.log('Processed virtual clients data:', clientsData);
      
      setVirtualClients(clientsData);
    } catch (err) {
      console.error('Failed to load virtual clients:', err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError]);

  const fetchRealClients = useCallback(async () => {
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
  }, [token, handleAuthError]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await get('/api/supplier-management/products?per_page=100', { token });
      console.log('Products API Response:', res);
      
      // Handle both old format (res.data.products) and new format (res.data)
      const productsData = res.data?.data || res.data?.products?.data || res.data?.products || res.data || [];
      console.log('Processed products data:', productsData);
      
      setProducts(productsData);
    } catch (err) {
      console.error('Failed to load products:', err);
      handleAuthError(err);
    }
  }, [token, handleAuthError]);



  // Performance: Memoize form handlers
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCartFormChange = useCallback((field, value) => {
    setCartFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMergeFormChange = useCallback((field, value) => {
    setMergeFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Performance: Memoize action handlers
  const createVirtualClient = useCallback(async () => {
    try {
      setSubmitting(true);
      
      // Validate form data
      if (!formData.name || !formData.phone || !formData.email) {
        toast.show(t('virtual_clients.please_fill_required_fields'), 'error');
        return;
      }
      
      // Check if phone number already exists in virtual clients
      if (Array.isArray(virtualClients)) {
        const existingVirtualClient = virtualClients.find(client => client.phone === formData.phone);
        if (existingVirtualClient) {
          toast.show(t('virtual_clients.phone_already_exists_virtual'), 'error');
          return;
        }
      }
      
      // Check if phone number already exists in real clients
      if (Array.isArray(realClients)) {
        const existingRealClient = realClients.find(client => 
          (client.phone === formData.phone) || 
          (client.client?.phone === formData.phone)
        );
        if (existingRealClient) {
          toast.show(t('virtual_clients.phone_already_exists_real'), 'error');
          return;
        }
      }
      
      const res = await post('/api/supplier/clients', { 
        data: formData, 
        token 
      });
      
      if (res.success) {
        toast.show(t('virtual_clients.virtual_client_created'), 'success');
        setModalOpen(false);
        setFormData({ name: '', name_ar: '', phone: '', email: '' });
        fetchVirtualClients();
      } else {
        toast.show(res.message || t('virtual_clients.failed_to_create_client'), 'error');
      }
    } catch (err) {
      console.error('Create virtual client error:', err);
      // Handle specific duplicate phone error
      if (err.message?.includes('Duplicate entry') && err.message?.includes('clients_phone_unique')) {
        toast.show(t('virtual_clients.phone_already_exists_database'), 'error');
      } else {
        handleAuthError(err);
      }
    } finally {
      setSubmitting(false);
    }
  }, [formData, token, toast, t, fetchVirtualClients, handleAuthError, virtualClients, realClients]);

  const addToCart = useCallback(async () => {
    if (!selectedClient) return;
    
    try {
      setSubmitting(true);
      
      if (!cartFormData.product_id || !cartFormData.quantity) {
        toast.show(t('virtual_clients.please_select_product_and_quantity'), 'error');
        return;
      }
      
      const res = await post(`/api/supplier/cart/${selectedClient.id}/items`, { 
        data: cartFormData, 
        token 
      });
      
      if (res.success) {
        toast.show(t('virtual_clients.cart_item_added'), 'success');
        setModalOpen(false);
        setCartFormData({ product_id: '', quantity: 1 });
        // Add the new item to local cart state
        const newItem = {
          id: res.data?.id || Date.now(),
          product_id: cartFormData.product_id,
          quantity: cartFormData.quantity,
          product: products.find(p => p.id === cartFormData.product_id)
        };
        setCartItems(prev => [...prev, newItem]);
      } else {
        toast.show(res.message || t('virtual_clients.failed_to_add_to_cart'), 'error');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      handleAuthError(err);
    } finally {
      setSubmitting(false);
    }
  }, [selectedClient, cartFormData, token, toast, t, handleAuthError, products]);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    if (!selectedClient) return;
    
    try {
      const res = await put(`/api/supplier/cart/${selectedClient.id}/items/${itemId}`, { 
        data: { quantity }, 
        token 
      });
      
      if (res.success) {
        toast.show(t('virtual_clients.cart_item_updated'), 'success');
        // Update the item in local cart state
        setCartItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        ));
      } else {
        toast.show(res.message || t('virtual_clients.failed_to_update_cart'), 'error');
      }
    } catch (err) {
      console.error('Update cart item error:', err);
      handleAuthError(err);
    }
  }, [selectedClient, token, toast, t, handleAuthError]);

  const removeFromCart = useCallback(async (itemId) => {
    if (!selectedClient) return;
    
    try {
      const res = await del(`/api/supplier/cart/${selectedClient.id}/items/${itemId}`, { token });
      
      if (res.success) {
        toast.show(t('virtual_clients.cart_item_removed'), 'success');
        // Remove the item from local cart state
        setCartItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        toast.show(res.message || t('virtual_clients.failed_to_remove_from_cart'), 'error');
      }
    } catch (err) {
      console.error('Remove from cart error:', err);
      handleAuthError(err);
    }
  }, [selectedClient, token, toast, t, handleAuthError]);

  const mergeVirtualClient = useCallback(async () => {
    if (!selectedClient || !mergeFormData.real_client_id) return;
    
    try {
      setSubmitting(true);
      
      const res = await post(`/api/supplier/clients/${selectedClient.id}/merge/${mergeFormData.real_client_id}`, { 
        data: {}, 
        token 
      });
      
      if (res.success) {
        toast.show(t('virtual_clients.virtual_client_merged'), 'success');
        setModalOpen(false);
        setMergeFormData({ real_client_id: '' });
        fetchVirtualClients();
      } else {
        toast.show(res.message || t('virtual_clients.failed_to_merge_client'), 'error');
      }
    } catch (err) {
      console.error('Merge virtual client error:', err);
      handleAuthError(err);
    } finally {
      setSubmitting(false);
    }
  }, [selectedClient, mergeFormData.real_client_id, token, toast, t, fetchVirtualClients, handleAuthError]);

  // Performance: Memoize modal handlers
  const openModal = useCallback((type, client = null) => {
    setModalType(type);
    setSelectedClient(client);
    
    // Initialize empty cart for new cart modal
    if (type === 'cart') {
      setCartItems([]);
    }
    
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedClient(null);
    setModalType('');
  }, []);

  // Performance: Memoize computed values
  const modalTitle = useMemo(() => {
    if (modalType === 'create') return t('virtual_clients.create_virtual_client_title');
    if (modalType === 'cart') return t('virtual_clients.manage_cart_title', { name: selectedClient?.name });
    if (modalType === 'merge') return t('virtual_clients.merge_virtual_client_title', { name: selectedClient?.name });
    return 'Modal';
  }, [modalType, selectedClient?.name, t]);

  const hasVirtualClients = useMemo(() => virtualClients.length > 0, [virtualClients.length]);
  const hasCartItems = useMemo(() => cartItems.length > 0, [cartItems.length]);

  // Performance: Memoize action handlers for child components
  const handleManageCart = useCallback((client) => {
    openModal('cart', client);
  }, [openModal]);

  const handleMerge = useCallback((client) => {
    openModal('merge', client);
  }, [openModal]);

  // Initialize data on mount
  useEffect(() => {
    if (token) {
      fetchVirtualClients();
      fetchRealClients();
      fetchProducts();
    } else {
      toast.show(t('virtual_clients.please_log_in_access'), 'error');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Enhanced Page Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-10"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {t('virtual_clients.title')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    {t('virtual_clients.subtitle')}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{virtualClients.length} {t('virtual_clients.active_clients')}</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Action Button */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => openModal('create')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('virtual_clients.create_virtual_client')}
                </button>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('virtual_clients.quick_actions')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Virtual Clients Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('virtual_clients.virtual_clients')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('virtual_clients.manage_virtual_clients')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                    {virtualClients.length} {t('virtual_clients.clients')}
                  </div>
                </div>
              </div>
            </div>
            
            {!hasVirtualClients ? (
              <div className="p-12 sm:p-16 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full opacity-50 blur-xl"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-full inline-block">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('virtual_clients.no_virtual_clients')}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-md mx-auto">
                  {t('virtual_clients.no_virtual_clients_message')}
                </p>
                <button
                  onClick={() => openModal('create')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('virtual_clients.create_first_client')}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('virtual_clients.client_info')}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('virtual_clients.contact')}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('virtual_clients.created_date')}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('virtual_clients.status')}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          {t('virtual_clients.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {virtualClients.map((client, index) => (
                        <tr 
                          key={client.id} 
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          <VirtualClientRow
                            client={client}
                            onManageCart={handleManageCart}
                            onMerge={handleMerge}
                          />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-6 space-y-4">
                  {virtualClients.map((client) => (
                    <div key={client.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                      <MobileClientCard
                        client={client}
                        onManageCart={handleManageCart}
                        onMerge={handleMerge}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modals */}
          <Modal
            open={modalOpen}
            onClose={closeModal}
            title={modalTitle}
          >
            {modalType === 'create' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    {t('virtual_clients.name_required')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    placeholder={t('virtual_clients.name_placeholder')}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    {t('virtual_clients.name_arabic')}
                  </label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => handleFormChange('name_ar', e.target.value)}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    placeholder={t('virtual_clients.name_arabic_placeholder')}
                    dir="rtl"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    {t('virtual_clients.phone_required')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    placeholder={t('virtual_clients.phone_placeholder')}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    {t('virtual_clients.email_required')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    placeholder={t('virtual_clients.email_placeholder')}
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="theme-button-secondary flex-1 sm:flex-none py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base"
                  >
                    {t('virtual_clients.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={createVirtualClient}
                    disabled={submitting}
                    className="theme-button flex-1 sm:flex-none py-2 sm:py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {submitting ? t('virtual_clients.creating') : t('virtual_clients.create_client')}
                  </button>
                </div>
              </div>
            )}

            {modalType === 'cart' && (
              <div className="space-y-4">
                {/* Add to Cart Form */}
                <div className="bg-theme-surface rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-theme-text mb-4">{t('virtual_clients.add_to_cart_title')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-2">
                        {t('virtual_clients.product')}
                      </label>
                      <select
                        value={cartFormData.product_id}
                        onChange={(e) => handleCartFormChange('product_id', e.target.value)}
                        className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                      >
                        <option value="">{t('virtual_clients.select_product')}</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ${formatCurrency(product.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-2">
                        {t('virtual_clients.quantity')}
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
                    {submitting ? t('virtual_clients.adding') : t('virtual_clients.add_to_cart')}
                  </button>
                </div>

                {/* Cart Items */}
                <div>
                  <h3 className="text-lg font-semibold text-theme-text mb-4">{t('virtual_clients.cart_items')}</h3>
                  {!hasCartItems ? (
                    <p className="text-theme-text-secondary text-center py-4">{t('virtual_clients.no_items_in_cart')}</p>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          onUpdateQuantity={updateCartItem}
                          onRemove={removeFromCart}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="theme-button-secondary px-4 py-2 rounded-lg text-sm sm:text-base"
                  >
                    {t('virtual_clients.close')}
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
                        {t('virtual_clients.merge_warning')}
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>
                          {t('virtual_clients.merge_warning_message')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    {t('virtual_clients.select_real_client')}
                  </label>
                  <select
                    value={mergeFormData.real_client_id}
                    onChange={(e) => handleMergeFormChange('real_client_id', e.target.value)}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                  >
                    <option value="">{t('virtual_clients.select_real_client_placeholder')}</option>
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
                    onClick={closeModal}
                    className="theme-button-secondary flex-1 sm:flex-none py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base"
                  >
                    {t('virtual_clients.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={mergeVirtualClient}
                    disabled={submitting || !mergeFormData.real_client_id}
                    className="bg-red-600 text-white flex-1 sm:flex-none py-2 sm:py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {submitting ? t('virtual_clients.merging') : t('virtual_clients.merge_client')}
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