import React, { useState, useEffect, useMemo } from 'react';
import SupplierLayout from '../../layouts/SupplierLayout';
import ProductDiscountsTable from '../../UI/supplier/ProductDiscountsTable';
import Pagination from '../../UI/supplier/Pagination';
import AddProductDiscountModal from '../../UI/supplier/AddProductDiscountModal';
import { useAuth } from '../../contexts/AuthContext';
import { get } from '../../utils/api';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

export default function ProductDiscounts() {
  const { t } = useSupplierTranslation();
  const [addDiscountOpen, setAddDiscountOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [productDiscounts, setProductDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { token } = useAuth();

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await get('/api/supplier-management/products', { token });
      // Handle the actual API response structure: res.data is the array directly
      const data = Array.isArray(res.data) ? res.data : (res.data?.products?.data || res.data?.products || []);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err.message);
      // Try fallback endpoint if main one fails
      try {
        const fallbackRes = await get('/api/supplier/products', { token });
        const fallbackData = Array.isArray(fallbackRes.data) ? fallbackRes.data : (fallbackRes.data?.products?.data || fallbackRes.data?.products || []);
        setProducts(fallbackData);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setProducts([]);
      }
    }
  };

  // Fetch clients
  const fetchClients = async () => {
    try {
      const res = await get('/api/supplier/invitations/clients', { token });
      // Handle the actual API response structure
      const data = Array.isArray(res.data) ? res.data : (res.data?.clients?.data || res.data?.clients || []);
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err.message);
    }
  };

  // Fetch product discounts (replace with real API if available)
  const fetchProductDiscounts = async (pageNum = page) => {
    setLoading(true);
    try {
      // If a real API endpoint exists, use it:
      // const res = await get(`/api/supplier/product-discounts?page=${pageNum}&per_page=10`, { token });
      // const discountsData = res.data?.data || res.data?.discounts?.data || res.data?.discounts || res.data || [];
      // setProductDiscounts(discountsData);
      // setTotalPages(res.data?.last_page || res.data?.discounts?.last_page || 1);

      // Placeholder: create combined data structure
      const combinedDiscounts = [];
      for (const product of products) {
        for (const client of clients) {
          if (product.default_discount && product.default_discount > 0) {
            combinedDiscounts.push({
              id: `${product.id}-${client.id}`,
              product: product,
              client: client,
              discount: product.default_discount,
              start_date: product.created_at,
              expiry_date: product.discount_expiry_date,
              status: 'active'
            });
          }
        }
      }
      const pageSize = 10;
      const pagedDiscounts = combinedDiscounts.slice((pageNum - 1) * pageSize, pageNum * pageSize);
      setProductDiscounts(pagedDiscounts);
      setTotalPages(Math.ceil(combinedDiscounts.length / pageSize));
    } catch (err) {
      console.error('Failed to load product discounts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchClients();
    }
  }, [token]);

  useEffect(() => {
    if (products.length > 0 && clients.length > 0) {
      fetchProductDiscounts(page);
    }
    // eslint-disable-next-line
  }, [products, clients, page]);

  // Filter product discounts
  const filteredProductDiscounts = useMemo(() => {
    return productDiscounts.filter(discount => {
      const productName = discount.product?.name || '';
      const clientName = discount.client?.name || discount.client?.company_name || '';
      const matchesSearch = !search || 
        productName.toLowerCase().includes(search.toLowerCase()) ||
        clientName.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = !status || discount.status === status;
      
      return matchesSearch && matchesStatus;
    });
  }, [productDiscounts, search, status]);

  return (
    <SupplierLayout title={t('product_discounts.title')}>
      {/* Page Header with Search and Actions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={t('product_discounts.search_placeholder')}
                className="w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">{t('product_discounts.all_statuses')}</option>
              <option value="active">{t('product_discounts.active')}</option>
              <option value="inactive">{t('product_discounts.inactive')}</option>
            </select>
          </div>

          {/* Add Product Discount Button */}
          <button
            onClick={() => setAddDiscountOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('product_discounts.add_discount')}
          </button>
        </div>
      </div>

      {/* Table and Pagination */}
      <ProductDiscountsTable 
        productDiscounts={filteredProductDiscounts} 
        loading={loading} 
        onAction={fetchProductDiscounts}
        onAdd={() => setAddDiscountOpen(true)}
      />
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
      
      <AddProductDiscountModal 
        open={addDiscountOpen} 
        onClose={() => setAddDiscountOpen(false)} 
        onSuccess={fetchProductDiscounts}
        products={products}
        clients={clients}
      />
    </SupplierLayout>
  );
} 