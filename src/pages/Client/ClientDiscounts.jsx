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
      <div className="min-h-screen bg-theme-bg p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton type="dashboard" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-theme-text">My Discounts</h1>
              <p className="text-sm sm:text-base text-theme-text-secondary">
                View all discounts available to you from your suppliers
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-theme-border">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('supplier')}
                className={`py-2 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'supplier'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-theme-text-secondary hover:text-theme-text hover:border-theme-border'
                }`}
              >
                Supplier Discounts ({filteredSupplierDiscounts.length})
              </button>
              <button
                onClick={() => setActiveTab('product')}
                className={`py-2 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors duration-200 whitespace-nowrap ${
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
        <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-sm border border-theme-border">
          {activeTab === 'supplier' ? (
            <div>
              {/* Supplier Discounts Table */}
              <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-theme-border">
                <h2 className="text-lg sm:text-xl font-semibold text-theme-text">Supplier Discounts</h2>
                <p className="text-sm sm:text-base text-theme-text-secondary mt-1 sm:mt-2">
                  Discounts applied to all products from specific suppliers
                </p>
              </div>
              
              {filteredSupplierDiscounts.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <div className="text-theme-text-muted mb-4 sm:mb-6">
                    <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-theme-text mb-2 sm:mb-3">No supplier discounts available</h3>
                  <p className="text-sm sm:text-base text-theme-text-secondary">
                    You don't have any supplier discounts at the moment.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
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

                  {/* Mobile Cards */}
                  <div className="md:hidden">
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      {filteredSupplierDiscounts.map((discount) => (
                        <div key={discount.id} className="bg-theme-surface rounded-lg sm:rounded-xl p-4 sm:p-6 border border-theme-border">
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <span className="text-sm sm:text-base font-medium text-primary-600 dark:text-primary-400">
                                  {discount.supplier?.name?.[0]?.toUpperCase() || 'S'}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm sm:text-base font-medium text-theme-text">
                                  {discount.supplier?.name || 'Unknown Supplier'}
                                </div>
                                <div className="text-xs sm:text-sm text-theme-text-secondary">
                                  {discount.supplier?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              {discount.default_discount}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs sm:text-sm text-theme-text-secondary">
                            <span>Applied: {formatDate(discount.created_at)}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Active
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Product Discounts Table */}
              <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-theme-border">
                <h2 className="text-lg sm:text-xl font-semibold text-theme-text">Product Discounts</h2>
                <p className="text-sm sm:text-base text-theme-text-secondary mt-1 sm:mt-2">
                  Special discounts on specific products
                </p>
              </div>
              
              {filteredProductDiscounts.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <div className="text-theme-text-muted mb-4 sm:mb-6">
                    <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-theme-text mb-2 sm:mb-3">No product discounts available</h3>
                  <p className="text-sm sm:text-base text-theme-text-secondary">
                    No products with special discounts are currently available.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
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

                  {/* Mobile Cards */}
                  <div className="md:hidden">
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      {filteredProductDiscounts.map((product) => {
                        const originalPrice = parseFloat(product.price) || 0;
                        const discountAmount = (originalPrice * product.discount) / 100;
                        const finalPrice = originalPrice - discountAmount;
                        
                        return (
                          <div key={product.id} className="bg-theme-surface rounded-lg sm:rounded-xl p-4 sm:p-6 border border-theme-border">
                            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm sm:text-base font-medium text-theme-text truncate">
                                  {product.name}
                                </div>
                                <div className="text-xs sm:text-sm text-theme-text-secondary">
                                  {product.category?.name || 'No category'}
                                </div>
                                <div className="text-xs sm:text-sm text-theme-text-secondary mt-1">
                                  {product.supplier?.name || 'Unknown Supplier'}
                                </div>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                -{product.discount}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <div className="space-y-1">
                                <div className="text-theme-text-secondary line-through">
                                  ${formatCurrency(originalPrice)}
                                </div>
                                <div className="font-medium text-theme-text">
                                  ${formatCurrency(finalPrice)}
                                </div>
                                <div className="text-green-600 dark:text-green-400">
                                  Save ${formatCurrency(discountAmount)}
                                </div>
                              </div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                Active
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 