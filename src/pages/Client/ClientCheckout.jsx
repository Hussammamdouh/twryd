import React, { useEffect, useState } from 'react';
import { get, post } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Spinner from '../../UI/supplier/Spinner';
import { Link } from 'react-router-dom';

export default function ClientCheckout() {
  const { token } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});
  const [notes, setNotes] = useState({});
  const [success, setSuccess] = useState({});

  // Fetch cart
  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await get('/api/client/cart', { token });
      setCart(data.data?.cart || null);
    } catch (err) {
      toast.show(err.message || 'Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, []);

  // Group items by supplier
  const grouped = React.useMemo(() => {
    if (!cart || !cart.items) return [];
    // Based on the API response, each cart has a single supplier
    const supplier_id = cart.supplier?.id || 'unknown';
    return [{ supplier_id, supplier: cart.supplier, items: cart.items }];
  }, [cart]);

  // Submit order for a supplier
  const handleSubmitOrder = async (supplier_id) => {
    setSubmitting(s => ({ ...s, [supplier_id]: true }));
    setSuccess(s => ({ ...s, [supplier_id]: false }));
    try {
      const response = await post('/api/client/orders/submit', {
        token,
        data: { supplier_id, notes: notes[supplier_id] || '' },
      });
      const orderId = response?.data?.id || response?.data?.order_id;
      setSuccess(s => ({ ...s, [supplier_id]: true }));
      toast.show('Order submitted!', 'success');
      fetchCart();
      if (orderId) {
        window.location.href = `/client/dashboard/order-confirmation/${orderId}`;
      }
    } catch (err) {
      toast.show(err.message || 'Failed to submit order', 'error');
    } finally {
      setSubmitting(s => ({ ...s, [supplier_id]: false }));
    }
  };

  if (loading) return <Spinner />;
  if (!cart || !cart.items || cart.items.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-24">
      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
      </svg>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 mb-1 sm:mb-2">Your cart is empty</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">Add products to your cart to proceed to checkout.</p>
      <Link to="/client/dashboard/my-marketplace" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-sm sm:text-base">Go to Marketplace</Link>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg sm:rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-gray-900 dark:text-white">Checkout</span>
              <span className="text-gray-500 dark:text-gray-400 font-normal text-base sm:text-lg lg:text-xl ml-0 sm:ml-2">Complete your order</span>
            </div>
          </div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">Review your order details and place your order.</p>
      </div>

      {grouped.map(group => (
        <div key={group.supplier_id} className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">Supplier: {group.supplier?.name || 'Unknown'}</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{group.supplier?.email || ''}</p>
              </div>
              {success[group.supplier_id] && (
                <div className="flex items-center gap-1 sm:gap-2 text-green-600 font-semibold text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="hidden sm:inline">Order placed!</span>
                  <span className="sm:hidden">✓</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm mb-4 sm:mb-6">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">Product</th>
                    <th className="p-3 text-center font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                    <th className="p-3 text-center font-semibold text-gray-700 dark:text-gray-300">Price</th>
                    <th className="p-3 text-center font-semibold text-gray-700 dark:text-gray-300">Discount</th>
                    <th className="p-3 text-center font-semibold text-gray-700 dark:text-gray-300">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map(item => (
                    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-600">
                      <td className="p-3 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{item.product?.name || 'Unknown Product'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.product?.id || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-3 text-center text-gray-900 dark:text-white font-medium">{item.quantity}</td>
                      <td className="p-3 text-center text-gray-900 dark:text-white">${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                      <td className="p-3 text-center text-gray-900 dark:text-white">
                        {item.product?.base_discount ? `${item.product.base_discount}%` : '-'}
                      </td>
                      <td className="p-3 text-center font-semibold text-primary-600 dark:text-primary-400">${parseFloat(item.total_price || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3 mb-4 sm:mb-6">
              {group.items.map(item => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{item.product?.name || 'Unknown Product'}</div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">SKU: {item.product?.id || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-400">Qty</div>
                      <div className="font-medium text-gray-900 dark:text-white">{item.quantity}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-400">Price</div>
                      <div className="text-gray-900 dark:text-white">${parseFloat(item.unit_price || 0).toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-400">Subtotal</div>
                      <div className="font-semibold text-primary-600 dark:text-primary-400">${parseFloat(item.total_price || 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Order Notes (Optional)</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl p-3 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  rows={3}
                  placeholder="Add any special instructions or notes for this order..."
                  value={notes[group.supplier_id] || ''}
                  onChange={e => setNotes(n => ({ ...n, [group.supplier_id]: e.target.value }))}
                  disabled={submitting[group.supplier_id] || success[group.supplier_id]}
                />
              </div>
              <div className="flex flex-col items-end gap-3 sm:gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                      ${group.items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0).toFixed(2)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total for this supplier</p>
                  </div>
                </div>
                <button
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-lg sm:rounded-xl shadow-lg disabled:opacity-60 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
                  disabled={submitting[group.supplier_id] || success[group.supplier_id]}
                  onClick={() => handleSubmitOrder(group.supplier_id)}
                >
                  {submitting[group.supplier_id] ? (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="text-center mt-6 sm:mt-8">
        <Link
          to="/client/dashboard/cart"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors duration-200 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Cart
        </Link>
      </div>
    </div>
  );
} 