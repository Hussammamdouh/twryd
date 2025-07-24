import React, { useEffect, useState, useMemo } from 'react';
import { get, post } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Spinner from '../../UI/supplier/Spinner';

export default function ClientMarketplace() {
  const { token } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState({});
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  // Fetch categories
  useEffect(() => {
    get('/api/v1/categories', { token })
      .then(res => setCategories(res.data || res.data?.data || []))
      .catch(() => setCategories([]));
  }, [token]);

  // Fetch suppliers
  useEffect(() => {
    get('/api/client/invitations/suppliers', { token })
      .then(res => setSuppliers(res.data?.suppliers || []))
      .catch(() => setSuppliers([]));
  }, [token]);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    let url = '/api/client-management/products';
    if (filterSupplier && filterCategory) {
      url = `/api/client-management/products-by-supplier-category/${filterSupplier}/${filterCategory}`;
    } else if (filterSupplier) {
      url = `/api/client-management/products-by-supplier/${filterSupplier}`;
    } else if (filterCategory) {
      url = `/api/client-management/products-by-category/${filterCategory}`;
    } else if (search) {
      url = `/api/client-management/products-search?query=${encodeURIComponent(search)}`;
    }
    get(url, { token })
      .then(res => setProducts(res.data?.products || res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [token, filterSupplier, filterCategory, search]);

  // Sorting (client-side for now)
  const sortedProducts = useMemo(() => {
    let arr = [...products];
    if (sort === 'newest') {
      arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === 'price-asc') {
      arr.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      arr.sort((a, b) => b.price - a.price);
    } else if (sort === 'discount-desc') {
      arr.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }
    return arr;
  }, [products, sort]);

  // Quick Add to Cart
  const handleAddToCart = async (product) => {
    setCartLoading(l => ({ ...l, [product.id]: true }));
    try {
      await post('/api/client/cart/items', {
        token,
        data: { product_id: product.id, quantity: 1 },
      });
      toast.show('Added to cart!', 'success');
    } catch (err) {
      toast.show(err.message || 'Failed to add to cart', 'error');
    } finally {
      setCartLoading(l => ({ ...l, [product.id]: false }));
    }
  };

  // UI
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text dark:bg-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Marketplace</h1>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          <select
            className="theme-input px-3 py-2 rounded border"
            value={filterSupplier}
            onChange={e => setFilterSupplier(e.target.value)}
          >
            <option value="">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s.id || s.supplier_id} value={s.id || s.supplier_id}>{s.name || s.supplier?.name}</option>
            ))}
          </select>
          <select
            className="theme-input px-3 py-2 rounded border"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            className="theme-input px-3 py-2 rounded border flex-1 min-w-[200px]"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="theme-input px-3 py-2 rounded border"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="discount-desc">Biggest Discount</option>
          </select>
        </div>
        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-24"><Spinner size={32} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map(product => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col relative">
                {product.discount > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-{product.discount}% Off</span>
                )}
                <div className="h-36 flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-700 rounded">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="max-h-32 object-contain" />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded" />
                  )}
                </div>
                <div className="font-semibold text-lg mb-1">{product.name}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary-600 font-bold text-xl">${product.price - (product.price * (product.discount || 0) / 100).toFixed(2)}</span>
                  {product.discount > 0 && (
                    <span className="line-through text-gray-400 text-sm">${product.price}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  by {product.supplier_name || product.supplier?.name || 'Unknown'}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  {product.in_stock ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">In Stock</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Out of Stock</span>
                  )}
                </div>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
                  onClick={() => handleAddToCart(product)}
                  disabled={cartLoading[product.id] || !product.in_stock}
                >
                  {cartLoading[product.id] ? <Spinner size={16} color="border-white" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h9.04a2 2 0 001.83-2.7L17 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" /></svg>}
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 