import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { get, post } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Spinner from '../../UI/supplier/Spinner';
import { useQueryClient } from '@tanstack/react-query';

export default function ClientProductDetails() {
  const { productId } = useParams();
  const { token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [tab, setTab] = useState('description');
  const [related, setRelated] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [mainImage, setMainImage] = useState('');

  // Fetch product details
  useEffect(() => {
    setLoading(true);
    get(`/api/client-management/products/${productId}`, { token })
      .then(res => setProduct(res.data || res.data?.product || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId, token]);

  // Fetch related products (same category)
  useEffect(() => {
    if (product?.category_id) {
      get(`/api/client-management/products-by-category/${product.category_id}`, { token })
        .then(res => setRelated((res.data?.products || res.data || []).filter(p => p.id !== product.id)))
        .catch(() => setRelated([]));
    }
  }, [product, token]);

  // Recently viewed (localStorage fallback)
  useEffect(() => {
    if (product) {
      let viewed = JSON.parse(localStorage.getItem('recently_viewed_products') || '[]');
      viewed = viewed.filter(p => p.id !== product.id);
      viewed.unshift(product);
      if (viewed.length > 8) viewed = viewed.slice(0, 8);
      localStorage.setItem('recently_viewed_products', JSON.stringify(viewed));
      setRecentlyViewed(viewed.filter(p => p.id !== product.id));
    }
  }, [product]);

  // Gallery images (if product.images is array, else fallback to image_url)
  const images = product && product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product && product.image_url ? [product.image_url] : [];

  // Set main image when product or images change
  useEffect(() => {
    if (images && images.length > 0) {
      setMainImage(images[0]);
    } else {
      setMainImage('');
    }
    // eslint-disable-next-line
  }, [productId, images]);

  // UI
  if (loading) {
    return <div className="flex justify-center py-24"><Spinner size={32} /></div>;
  }

  if (!product) {
    return <div className="text-center text-red-500 py-24">Product not found or unavailable.</div>;
  }

  // Price calculation
  const discountedPrice = (product.price - (product.price * (product.discount || 0) / 100)).toFixed(2);

  const handleAddToCart = async () => {
    setCartLoading(true);
    try {
      await post('/api/client/cart/items', {
        token,
        data: { product_id: product.id, quantity: quantity },
      });
      toast.show('Added to cart!', 'success');
      // Invalidate cart queries to refresh cart data
      queryClient.invalidateQueries(['client-cart']);
      queryClient.invalidateQueries(['cart']);
    } catch (err) {
      toast.show(err.message || 'Failed to add to cart', 'error');
    } finally {
      setCartLoading(false);
    }
  };

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
            <span className="text-gray-900 dark:text-white">Product Details</span>
            <span className="text-gray-500 dark:text-gray-400 font-normal text-lg sm:text-xl ml-2">View and purchase this product</span>
          </div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">See product information, supplier details, and related products.</p>
      </div>

      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-500 mb-4 flex items-center gap-2">
        <Link to="/client/dashboard/my-marketplace" className="hover:underline">Marketplace</Link>
        <span>/</span>
        <span className="font-semibold text-gray-900 dark:text-white">{product.name}</span>
      </nav>

      {/* Product Main Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-8 mb-8">
        {/* Gallery */}
        <div className="flex flex-col items-center md:w-1/2">
          <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mb-4">
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="max-h-60 object-contain" />
            ) : (
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded" />
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setMainImage(img)} className={`w-12 h-12 rounded border ${mainImage === img ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                <img src={img} alt="thumb" className="w-full h-full object-contain rounded" />
              </button>
            ))}
          </div>
        </div>
        {/* Info */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{product.name}</h2>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-primary-600 font-bold text-2xl">${discountedPrice}</span>
            {product.discount > 0 && (
              <span className="line-through text-gray-400 text-lg">${product.price}</span>
            )}
            {product.discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-{product.discount}% Off</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            by {product.supplier_name || product.supplier?.name || 'Unknown'}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm">QUANTITY</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-lg font-bold"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >-</button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-16 px-2 py-1 border rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-lg font-bold"
                onClick={() => setQuantity(q => q + 1)}
                aria-label="Increase quantity"
              >+</button>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-60"
              onClick={handleAddToCart}
              disabled={cartLoading}
            >
              {cartLoading ? <Spinner size={16} color="border-white" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h9.04a2 2 0 001.83-2.7L17 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" /></svg>}
              Add to Cart
            </button>
          </div>
          <div className="flex gap-2 text-gray-400 text-lg">
            {product.product_url && <a href={product.product_url} target="_blank" rel="noopener noreferrer" title="Product Link"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656m-1.414-1.414a2 2 0 010-2.828m-2.828 2.828a4 4 0 010-5.656m1.414 1.414a2 2 0 010 2.828" /></svg></a>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex gap-6 border-b mb-4">
          <button className={`pb-2 font-semibold ${tab === 'description' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`} onClick={() => setTab('description')}>Product Description</button>
          <button className={`pb-2 font-semibold ${tab === 'supplier' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`} onClick={() => setTab('supplier')}>Supplier Details</button>
          <button className={`pb-2 font-semibold ${tab === 'related' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`} onClick={() => setTab('related')}>Related Products</button>
        </div>
        {tab === 'description' && (
          <div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">{product.description || 'No description available.'}</div>
          </div>
        )}
        {tab === 'supplier' && (
          <div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
              <div><span className="font-semibold">Supplier Name:</span> {product.supplier?.name || product.supplier_name || 'N/A'}</div>
              <div><span className="font-semibold">Supplier Email:</span> {product.supplier?.email || 'N/A'}</div>
            </div>
          </div>
        )}
        {tab === 'related' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.length === 0 && <div className="col-span-2 text-gray-400">No related products found.</div>}
            {related.slice(0, 4).map(rp => (
              <div key={rp.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col">
                <div className="h-24 flex items-center justify-center mb-2 bg-gray-100 dark:bg-gray-600 rounded">
                  {rp.image_url ? <img src={rp.image_url} alt={rp.name} className="max-h-20 object-contain" /> : <div className="w-16 h-16 bg-gray-200 dark:bg-gray-500 rounded" />}
                </div>
                <div className="font-semibold mb-1">{rp.name}</div>
                <div className="text-primary-600 font-bold mb-1">${(rp.price - (rp.price * (rp.discount || 0) / 100)).toFixed(2)}</div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 rounded mt-auto"
                  onClick={() => navigate(`/client/dashboard/my-marketplace/product/${rp.id}`)}
                >View Product</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Viewed */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Recently Viewed Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recentlyViewed.length === 0 && <div className="col-span-2 text-gray-400">No recently viewed products.</div>}
          {recentlyViewed.slice(0, 4).map(rv => (
            <div key={rv.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col">
              <div className="h-24 flex items-center justify-center mb-2 bg-gray-100 dark:bg-gray-600 rounded">
                {rv.image_url ? <img src={rv.image_url} alt={rv.name} className="max-h-20 object-contain" /> : <div className="w-16 h-16 bg-gray-200 dark:bg-gray-500 rounded" />}
              </div>
              <div className="font-semibold mb-1">{rv.name}</div>
              <div className="text-primary-600 font-bold mb-1">${(rv.price - (rv.price * (rv.discount || 0) / 100)).toFixed(2)}</div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 rounded mt-auto"
                onClick={() => navigate(`/client/dashboard/my-marketplace/product/${rv.id}`)}
              >View Product</button>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Shipping Information</h3>
        <div className="text-sm text-gray-700 dark:text-gray-200">
          <div>Estimated shipping: 2-5 business days.</div>
          <div>Free shipping on orders over $50.</div>
          <div>Extra charges may be applicable for an additional fee.</div>
        </div>
      </div>
    </div>
  );
} 