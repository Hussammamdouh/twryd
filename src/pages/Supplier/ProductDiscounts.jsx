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
      const data = res.data?.products?.data || res.data?.products || [];
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err.message);
    }
  };

  // Fetch clients
  const fetchClients = async () => {
    try {
      const res = await get('/api/supplier/invitations/clients', { token });
      const data = res.data?.clients?.data || res.data?.clients || [];
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err.message);
    }
  };

  // Fetch product discounts (we'll need to create this data structure)
  const fetchProductDiscounts = async () => {
    setLoading(true);
    try {
      // For now, we'll create a combined data structure from products and clients
      // In a real scenario, there might be a specific API endpoint for this
      const combinedDiscounts = [];
      
      // This is a placeholder - in reality, you'd have an API endpoint that returns
      // all product discounts for the supplier
      for (const product of products) {
        for (const client of clients) {
          // Check if this product has a discount for this client
          // This would come from the actual API response
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
      
      setProductDiscounts(combinedDiscounts);
      setTotalPages(Math.ceil(combinedDiscounts.length / 10));
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
      fetchProductDiscounts();
    }
  }, [products, clients]);

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