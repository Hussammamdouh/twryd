import React, { useEffect, useState } from 'react';
import { get, post } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Spinner from '../../UI/supplier/Spinner';

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
      setCart(data.data || null);
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
    const map = {};
    cart.items.forEach(item => {
      if (!map[item.supplier_id]) map[item.supplier_id] = { supplier: item.supplier, items: [] };
      map[item.supplier_id].items.push(item);
    });
    return Object.entries(map).map(([supplier_id, group]) => ({ supplier_id, ...group }));
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
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Checkout</h1>
      {grouped.map(group => (
        <div key={group.supplier_id} className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <div className="font-semibold text-lg dark:text-white">Supplier: {group.supplier?.name || 'Unknown'}</div>
            {success[group.supplier_id] && <span className="ml-4 text-green-600 font-medium">Order placed!</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-2 text-left">Product</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Discount</th>
                  <th className="p-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-2 flex items-center gap-2">
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover" />
                      <span className="dark:text-white">{item.name}</span>
                    </td>
                    <td className="p-2 text-center dark:text-white">{item.quantity}</td>
                    <td className="p-2 text-center dark:text-white">${item.price.toFixed(2)}</td>
                    <td className="p-2 text-center dark:text-white">{item.discount ? `${item.discount}%` : '-'}</td>
                    <td className="p-2 text-center font-semibold dark:text-white">${((item.price - (item.price * (item.discount || 0) / 100)) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <textarea
                className="w-full border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
                rows={2}
                placeholder="Order notes (optional)"
                value={notes[group.supplier_id] || ''}
                onChange={e => setNotes(n => ({ ...n, [group.supplier_id]: e.target.value }))}
                disabled={submitting[group.supplier_id] || success[group.supplier_id]}
              />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="font-bold text-lg dark:text-white">
                Subtotal: $
                {group.items.reduce((sum, item) => sum + (item.price - (item.price * (item.discount || 0) / 100)) * item.quantity, 0).toFixed(2)}
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-60"
                disabled={submitting[group.supplier_id] || success[group.supplier_id]}
                onClick={() => handleSubmitOrder(group.supplier_id)}
              >
                {submitting[group.supplier_id] ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="text-center mt-8">
        <a href="/client/dashboard/cart" className="text-blue-600 underline">Back to Cart</a>
      </div>
    </div>
  );
} 