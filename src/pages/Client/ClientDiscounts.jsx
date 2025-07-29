import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { get } from '../../utils/api';
import { useToast } from '../../UI/Common/ToastContext';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';

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

export default function ClientDiscounts() {
  const [supplierDiscounts, setSupplierDiscounts] = useState([]);
  const [productDiscounts, setProductDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('supplier'); // 'supplier' or 'product'
  const { token } = useAuth();
  const toast = useToast();

  // Fetch supplier discounts
  const fetchSupplierDiscounts = async () => {
    try {
      const res = await get('/api/client-management/discounts', { token });
      setSupplierDiscounts(res.data?.discounts || res.data || []);
    } catch (err) {
      console.error('Failed to load supplier discounts:', err.message);
      toast.show('Failed to load supplier discounts', 'error');
    }
  };

  // Fetch product discounts (from products with discounts)
  const fetchProductDiscounts = async () => {
    try {
      const res = await get('/api/client-management/products', { token });
      const products = res.data?.products || res.data || [];
      // Filter products that have discounts
      const productsWithDiscounts = products.filter(product => 
        product.discount && product.discount > 0
      );
      setProductDiscounts(productsWithDiscounts);
    } catch (err) {
      console.error('Failed to load product discounts:', err.message);
      toast.show('Failed to load product discounts', 'error');
    }
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSupplierDiscounts(),
        fetchProductDiscounts()
      ]);
    } catch (err) {
      console.error('Failed to load discounts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Filtered data based on active tab
  const filteredSupplierDiscounts = useMemo(() => {
    return supplierDiscounts.filter(discount => 
      discount.default_discount && discount.default_discount > 0
    );
  }, [supplierDiscounts]);

  const filteredProductDiscounts = useMemo(() => {
    return productDiscounts.filter(product => 
      product.discount && product.discount > 0
    );
  }, [productDiscounts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton type="dashboard" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text mb-2">My Discounts</h1>
          <p className="text-theme-text-secondary">
            View all discounts available to you from your suppliers
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-theme-border">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('supplier')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'supplier'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-theme-text-secondary hover:text-theme-text hover:border-theme-border'
                }`}
              >
                Supplier Discounts ({filteredSupplierDiscounts.length})
              </button>
              <button
                onClick={() => setActiveTab('product')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'product'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-theme-text-secondary hover:text-theme-text hover:border-theme-border'
                }`}
              >
                Product Discounts ({filteredProductDiscounts.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-theme-border">
          {activeTab === 'supplier' ? (
            <div>
              {/* Supplier Discounts Table */}
              <div className="px-6 py-4 border-b border-theme-border">
                <h2 className="text-lg font-semibold text-theme-text">Supplier Discounts</h2>
                <p className="text-sm text-theme-text-secondary mt-1">
                  Discounts applied to all products from specific suppliers
                </p>
              </div>
              
              {filteredSupplierDiscounts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-theme-text-muted mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-theme-text mb-2">No supplier discounts available</h3>
                  <p className="text-theme-text-secondary">
                    You don't have any supplier discounts at the moment.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-theme-border">
                    <thead className="bg-theme-surface">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Discount Percentage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Applied Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-theme-border">
                      {filteredSupplierDiscounts.map((discount) => (
                        <tr key={discount.id} className="hover:bg-theme-surface transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                    {discount.supplier?.name?.[0]?.toUpperCase() || 'S'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-theme-text">
                                  {discount.supplier?.name || 'Unknown Supplier'}
                                </div>
                                <div className="text-sm text-theme-text-secondary">
                                  {discount.supplier?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              {discount.default_discount}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">
                            {formatDate(discount.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Product Discounts Table */}
              <div className="px-6 py-4 border-b border-theme-border">
                <h2 className="text-lg font-semibold text-theme-text">Product Discounts</h2>
                <p className="text-sm text-theme-text-secondary mt-1">
                  Special discounts on specific products
                </p>
              </div>
              
              {filteredProductDiscounts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-theme-text-muted mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-theme-text mb-2">No product discounts available</h3>
                  <p className="text-theme-text-secondary">
                    No products with special discounts are currently available.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-theme-border">
                    <thead className="bg-theme-surface">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Original Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Discount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Final Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-theme-border">
                      {filteredProductDiscounts.map((product) => {
                        const originalPrice = parseFloat(product.price) || 0;
                        const discountAmount = (originalPrice * product.discount) / 100;
                        const finalPrice = originalPrice - discountAmount;
                        
                        return (
                          <tr key={product.id} className="hover:bg-theme-surface transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-theme-text">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-theme-text-secondary">
                                    {product.category?.name || 'No category'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-theme-text">
                                {product.supplier?.name || 'Unknown Supplier'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">
                              ${formatCurrency(originalPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                -{product.discount}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-theme-text">
                                ${formatCurrency(finalPrice)}
                              </div>
                              <div className="text-xs text-theme-text-secondary">
                                Save ${formatCurrency(discountAmount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                Active
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 