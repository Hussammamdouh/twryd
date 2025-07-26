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
    <div className="p-8 text-center text-gray-500 dark:text-gray-300">
      Your cart is empty. <a href="/client/dashboard/my-marketplace" className="text-blue-600 underline">Go to Marketplace</a>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white mb-2">Checkout</h1>
        <p className="text-gray-600 dark:text-gray-400">Review your order and complete your purchase</p>
      </div>
      {grouped.map(group => (
        <div key={group.supplier_id} className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold dark:text-white">Supplier: {group.supplier?.name || 'Unknown'}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{group.supplier?.email || ''}</p>
              </div>
              {success[group.supplier_id] && (
                <div className="ml-auto flex items-center gap-2 text-green-600 font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Order placed!
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
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
                          <div className="font-medium dark:text-white">{item.product?.name || 'Unknown Product'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.product?.id || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-3 text-center dark:text-white font-medium">{item.quantity}</td>
                      <td className="p-3 text-center dark:text-white">${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                      <td className="p-3 text-center dark:text-white">
                        {item.product?.base_discount ? `${item.product.base_discount}%` : '-'}
                      </td>
                      <td className="p-3 text-center font-semibold dark:text-white text-blue-600">${parseFloat(item.total_price || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Order Notes (Optional)</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows={3}
                  placeholder="Add any special instructions or notes for this order..."
                  value={notes[group.supplier_id] || ''}
                  onChange={e => setNotes(n => ({ ...n, [group.supplier_id]: e.target.value }))}
                  disabled={submitting[group.supplier_id] || success[group.supplier_id]}
                />
              </div>
              <div className="flex flex-col items-end gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${group.items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0).toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total for this supplier</p>
                  </div>
                </div>
                <button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl shadow-lg disabled:opacity-60 transition-all duration-200 flex items-center gap-2"
                  disabled={submitting[group.supplier_id] || success[group.supplier_id]}
                  onClick={() => handleSubmitOrder(group.supplier_id)}
                >
                  {submitting[group.supplier_id] ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="text-center mt-8">
        <Link
          to="/client/dashboard/cart"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Cart
        </Link>
      </div>
    </div>
  );
} 