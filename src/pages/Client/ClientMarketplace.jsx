import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { get, post } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Spinner from '../../UI/supplier/Spinner';

export default function ClientMarketplace() {
  const { token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState({});
  const [filterSupplier, setFilterSupplier] = useState(searchParams.get('supplier') || '');
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

  // Effect: If supplier_id in URL is not in connected suppliers, clear filter and show warning
  useEffect(() => {
    if (filterSupplier && suppliers.length > 0) {
      const found = suppliers.some(s => (s.id || s.supplier_id)?.toString() === filterSupplier.toString());
      if (!found) {
        setFilterSupplier('');
        setSearchParams({});
        toast.show('You do not have access to this supplier.', 'warning');
      }
    }
    // eslint-disable-next-line
  }, [filterSupplier, suppliers]);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    // Build query params
    const params = [];
    if (filterSupplier) params.push(`supplier_id=${encodeURIComponent(filterSupplier)}`);
    if (filterCategory) params.push(`category_id=${encodeURIComponent(filterCategory)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    const queryString = params.length ? `?${params.join('&')}` : '';
    const url = `/api/client-management/products${queryString}`;
    get(url, { token })
      .then(res => {
        setProducts(res.data?.products || res.data || []);
      })
      .catch(err => {
        if (err?.response?.data?.message?.includes('Access denied')) {
          toast.show('You do not have access to this supplier\'s products.', 'error');
          setFilterSupplier('');
          setSearchParams({});
          setProducts([]);
        } else {
          setProducts([]);
        }
      })
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

  // Handle product click to navigate to product details
  const handleProductClick = (product) => {
    navigate(`/client/dashboard/product/${product.id}`);
  };

  // Handle filter changes and update URL
  const handleSupplierFilterChange = (supplierId) => {
    setFilterSupplier(supplierId);
    if (supplierId) {
      setSearchParams({ supplier: supplierId });
    } else {
      setSearchParams({});
    }
  };

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
            onChange={e => handleSupplierFilterChange(e.target.value)}
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
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col relative cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleProductClick(product)}>
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
                  <span className="text-primary-600 font-bold text-xl">${(product.price - (product.price * (product.discount || 0) / 100)).toFixed(2)}</span>
                  {product.discount > 0 && (
                    <span className="line-through text-gray-400 text-sm">${product.price}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  by {product.supplier_name || product.supplier?.name || 'Unknown'}
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-auto disabled:opacity-60"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={cartLoading[product.id]}
                >
                  {cartLoading[product.id] ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 