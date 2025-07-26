import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, del, put } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Spinner from '../../UI/supplier/Spinner';

export default function ClientCart() {
  const { token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const [updatingQty, setUpdatingQty] = useState({});

  // Fetch cart
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await get('/api/client/cart', { token });
      setCart(res.data?.cart || null);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, [token]);

  // Group items by supplier
  const grouped = useMemo(() => {
    if (!cart || !cart.items) return [];
    // Based on the API response, each cart has a single supplier
    const supplier = cart.supplier?.name || 'Unknown Supplier';
    return [{ supplier, items: cart.items }];
  }, [cart]);

  // Remove item
  const handleRemove = async (item) => {
    setRemoving(r => ({ ...r, [item.id]: true }));
    try {
      await del(`/api/client/cart/items/${item.id}`, { token });
      toast.show('Item removed from cart', 'success');
      fetchCart();
    } catch (err) {
      toast.show(err.message || 'Failed to remove item', 'error');
    } finally {
      setRemoving(r => ({ ...r, [item.id]: false }));
    }
  };

  // Update quantity
  const handleUpdateQty = async (item, newQty) => {
    if (newQty < 1) return;
    setUpdatingQty(u => ({ ...u, [item.id]: true }));
    try {
      await put(`/api/client/cart/items/${item.id}`, {
        token,
        data: { quantity: newQty },
      });
      fetchCart();
    } catch (err) {
      toast.show(err.message || 'Failed to update quantity', 'error');
    } finally {
      setUpdatingQty(u => ({ ...u, [item.id]: false }));
    }
  };

  // Calculate totals
  const orderSummary = useMemo(() => {
    if (!cart || !cart.items) return { total: 0, count: 0 };
    let total = 0, count = 0;
    cart.items.forEach(item => {
      total += parseFloat(item.total_price || 0);
      count += item.quantity;
    });
    return { total, count };
  }, [cart]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <div>
            <span className="text-gray-900 dark:text-white">Shopping Cart</span>
            <span className="text-gray-500 dark:text-gray-400 font-normal text-lg sm:text-xl ml-2">Review your items</span>
          </div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Update quantities, remove items, or proceed to checkout.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner size={32} /></div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 dark:text-gray-400">Add products to your cart to see them here.</p>
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.supplier} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4">
                <div className="font-semibold mb-4 text-gray-900 dark:text-white">Supplier: {group.supplier}</div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {group.items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 py-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                        {item.image_url ? <img src={item.image_url} alt={item.name} className="max-h-14 object-contain" /> : <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">{item.product?.name || 'Unknown Product'}</div>
                        <div className="text-gray-500 text-sm">${item.unit_price}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => handleUpdateQty(item, Number(e.target.value))}
                          className="w-16 px-2 py-1 border rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          disabled={updatingQty[item.id]}
                        />
                        <span className="font-bold text-primary-600 text-lg">${item.total_price}</span>
                      </div>
                      <button
                        className="text-red-500 hover:underline ml-4 text-sm font-semibold disabled:opacity-60"
                        onClick={() => handleRemove(item)}
                        disabled={removing[item.id]}
                      >
                        {removing[item.id] ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-right font-bold text-xl mt-4">Subtotal: <span className="text-blue-600">${group.items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0).toFixed(2)}</span></div>
              </div>
            ))
          )}
        </div>
        {/* Order Summary */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4">
            <div className="font-semibold mb-2 text-gray-900 dark:text-white">Order Summary</div>
            <div className="flex justify-between text-sm mb-2">
              <span>Total Items:</span>
              <span>{orderSummary.count} {orderSummary.count === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total Amount:</span>
              <span className="text-blue-600">${orderSummary.total.toFixed(2)}</span>
            </div>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg mb-2 disabled:opacity-60"
              disabled={orderSummary.count === 0}
              onClick={() => navigate('/client/dashboard/checkout')}
            >
              Proceed to Checkout
            </button>
            <button
              className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 font-semibold mt-2"
              onClick={() => window.location.href = '/client/dashboard/my-marketplace'}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 