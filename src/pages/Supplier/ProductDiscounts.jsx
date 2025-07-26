import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../UI/supplier/Sidebar';
import Topbar from '../../UI/supplier/Topbar';
import ProductDiscountsTable from '../../UI/supplier/ProductDiscountsTable';
import Pagination from '../../UI/supplier/Pagination';
import AddProductDiscountModal from '../../UI/supplier/AddProductDiscountModal';
import { useAuth } from '../../contexts/AuthContext';
import { get } from '../../utils/api';

export default function ProductDiscounts() {
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
    <div className="min-h-screen bg-theme-bg">
      <Sidebar />
      <Topbar
        title="Product Discounts"
        search={search}
        onSearch={setSearch}
        status={status}
        onStatusChange={setStatus}
        onAdd={() => setAddDiscountOpen(true)}
        addButtonText="+ Add Product Discount"
        searchPlaceholder="Search by product name..."
      />
      <main className="pl-64 pt-20 pr-8">
        <div className="max-w-5xl mx-auto">
          <ProductDiscountsTable 
            productDiscounts={filteredProductDiscounts} 
            loading={loading} 
            onAction={fetchProductDiscounts} 
            onAdd={() => setAddDiscountOpen(true)} 
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </main>
      <AddProductDiscountModal 
        open={addDiscountOpen} 
        onClose={() => setAddDiscountOpen(false)} 
        onSuccess={fetchProductDiscounts} 
        products={products}
        clients={clients}
      />
    </div>
  );
} 