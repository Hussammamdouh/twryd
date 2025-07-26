import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../UI/supplier/Spinner';

export default function ClientOrderConfirmation() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Group items by supplier (hook must be unconditional)
  const grouped = React.useMemo(() => {
    if (!order || !order.items) return [];
    const map = {};
    order.items.forEach(item => {
      if (!map[item.supplier_id]) map[item.supplier_id] = { supplier: item.supplier, items: [] };
      map[item.supplier_id].items.push(item);
    });
    return Object.entries(map).map(([supplier_id, group]) => ({ supplier_id, ...group }));
  }, [order]);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await get(`/api/client/orders/${orderId}`, { token });
        setOrder(data.data || null);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, token]);

  const orderTotal = (order && order.items ? order.items : []).reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  const deliveryFee = order && order.delivery_fee ? order.delivery_fee : 0;
  const finalAmount = orderTotal + deliveryFee;

  if (loading) return <Spinner />;
  if (!order) return <div className="p-8 text-center text-gray-500 dark:text-gray-300">Order not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-xl border border-green-200 dark:border-green-800 p-8 mb-8 text-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3 dark:text-white">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Thank you! Your order has been placed successfully.</p>
          <p className="text-gray-500 dark:text-gray-400 mb-3">A confirmation email has been sent. You can track your order in your dashboard.</p>
          <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Order #{order.order_number || order.id}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Order Summary
              </h2>
            </div>
            <div className="p-6">
              {grouped.map(group => (
                <div key={group.supplier_id} className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg dark:text-white">{group.supplier?.name || 'Supplier'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{group.supplier?.email || ''}</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm mb-4">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          <th className="text-left p-3 font-semibold">Product</th>
                          <th className="p-3 text-center font-semibold">Quantity</th>
                          <th className="p-3 text-center font-semibold">Price</th>
                          <th className="p-3 text-center font-semibold">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map(item => (
                          <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="p-3 dark:text-white font-medium">{item.product?.name || item.name || 'Unknown Product'}</td>
                            <td className="p-3 text-center dark:text-white">{item.quantity || 0}</td>
                            <td className="p-3 text-center dark:text-white">${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                            <td className="p-3 text-center font-semibold dark:text-white text-blue-600">${parseFloat(item.total || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Delivery Method</div>
                      <div className="font-semibold dark:text-white">{group.supplier?.delivery_method || 'Standard'}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Estimated Delivery</div>
                      <div className="font-semibold dark:text-white">{group.supplier?.estimated_delivery || '2024-06-15'}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Assigned Warehouse</div>
                      <div className="font-semibold dark:text-white">{group.supplier?.warehouse || 'WH-001'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">Supplier Subtotal: ${group.items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2)}</div>
                  </div>
                </div>
              ))}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
                <div className="font-semibold mb-2 dark:text-white">Shipping & Contact Information</div>
                <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">Address: {order.shipping_address || '16 Garden Street, Cairo'}</div>
                <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">Phone: {order.shipping_phone || '+201234567890'}</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">Contact: {order.contact_name || 'Ahmed Youssef'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Order Total
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">Items Total:</span>
                <span className="font-semibold dark:text-white">${orderTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">Delivery Fees:</span>
                <span className="font-semibold dark:text-white">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3">
                <span className="text-lg font-bold dark:text-white">Final Amount:</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">${finalAmount.toFixed(2)}</span>
              </div>
              <div className="space-y-3 pt-4">
                <Link to={`/client/dashboard/orders/${order.id}`} className="w-full block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 text-center flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Track this Order
                </Link>
                <Link to="/client/dashboard/my-marketplace" className="w-full block bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 dark:text-gray-300 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl py-3 font-semibold transition-all duration-200 text-center flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M5 7h14l1 5H4l1-5zm2 8a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
                  </svg>
                  Continue Shopping
                </Link>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-500 dark:text-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2" disabled>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 