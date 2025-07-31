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
  const [quantities, setQuantities] = useState({});

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
    const quantity = quantities[product.id] || 1;
    if (quantity < 1) {
      toast.show('Quantity must be at least 1', 'error');
      return;
    }
    
    setCartLoading(l => ({ ...l, [product.id]: true }));
    try {
      await post('/api/client/cart/items', {
        token,
        data: { product_id: product.id, quantity: quantity },
      });
      toast.show(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`, 'success');
      // Reset quantity after successful add
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    } catch (err) {
      toast.show(err.message || 'Failed to add to cart', 'error');
    } finally {
      setCartLoading(l => ({ ...l, [product.id]: false }));
    }
  };

  // Handle quantity change
  const handleQuantityChange = (productId, value) => {
    const numValue = parseInt(value) || 1;
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, numValue) }));
  };

  // UI
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M5 7h14l1 5H4l1-5zm2 8a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
            </svg>
          </div>
          <div>
            <span className="text-gray-900 dark:text-white">Marketplace</span>
            <span className="text-gray-500 dark:text-gray-400 font-normal text-lg sm:text-xl ml-2">Browse Products</span>
          </div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Explore products from your connected suppliers and add them to your cart.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 flex flex-wrap gap-4 items-center">
        <select
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
          value={filterSupplier}
          onChange={e => handleSupplierFilterChange(e.target.value)}
        >
          <option value="">All Suppliers</option>
          {suppliers.map(s => (
            <option key={s.id || s.supplier_id} value={s.id || s.supplier_id}>{s.name || s.supplier?.name}</option>
          ))}
        </select>
        <select
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 flex-1 min-w-[200px]"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
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
      ) : sortedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M5 7h14l1 5H4l1-5zm2 8a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No products found</h2>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map(product => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col relative cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleProductClick(product)}>
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
              <div className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{product.name}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary-600 font-bold text-xl">${(product.price - (product.price * (product.discount || 0) / 100)).toFixed(2)}</span>
                {product.discount > 0 && (
                  <span className="line-through text-gray-400 text-sm">${product.price}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                by {product.supplier_name || product.supplier?.name || 'Unknown'}
              </div>
              
              {/* Quantity Input and Add to Cart */}
              <div className="flex items-center gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  min="1"
                  value={quantities[product.id] || 1}
                  onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                  className="w-16 px-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:opacity-60 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={cartLoading[product.id]}
                >
                  {cartLoading[product.id] ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 