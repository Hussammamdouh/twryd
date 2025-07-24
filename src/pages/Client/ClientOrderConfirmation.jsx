import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../../utils/api';
import Spinner from '../../UI/supplier/Spinner';

export default function ClientOrderConfirmation() {
  const { orderId } = useParams();
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
        const data = await get(`/api/client/orders/${orderId}`);
        setOrder(data.data || null);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const orderTotal = (order && order.items ? order.items : []).reduce((sum, item) => sum + (item.price - (item.price * (item.discount || 0) / 100)) * item.quantity, 0);
  const deliveryFee = order && order.delivery_fee ? order.delivery_fee : 0;
  const finalAmount = orderTotal + deliveryFee;

  if (loading) return <Spinner />;
  if (!order) return <div className="p-8 text-center text-gray-500 dark:text-gray-300">Order not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8 text-center">
        <div className="flex flex-col items-center">
          <div className="text-green-600 text-5xl mb-2">✓</div>
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Thank you! Your order has been placed successfully.</h1>
          <div className="text-gray-600 dark:text-gray-300 mb-1">A confirmation email has been sent. You can track your order in your dashboard.</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Order #{order.order_number || order.id}</div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="font-semibold mb-2 dark:text-white">Order Summary</div>
          {grouped.map(group => (
            <div key={group.supplier_id} className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {group.supplier?.logo_url && <img src={group.supplier.logo_url} alt={group.supplier.name} className="w-8 h-8 rounded-full" />}
                <span className="font-bold dark:text-white">{group.supplier?.name || 'Supplier'}</span>
              </div>
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400">
                    <th className="text-left p-1">Product</th>
                    <th className="p-1">Quantity</th>
                    <th className="p-1">Price</th>
                    <th className="p-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map(item => (
                    <tr key={item.id}>
                      <td className="p-1 dark:text-white">{item.name}</td>
                      <td className="p-1 text-center dark:text-white">{item.quantity}</td>
                      <td className="p-1 text-center dark:text-white">${item.price.toFixed(2)}</td>
                      <td className="p-1 text-center font-semibold dark:text-white">${((item.price - (item.price * (item.discount || 0) / 100)) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Delivery Method: {group.supplier?.delivery_method || 'Standard'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Estimated Delivery: {group.supplier?.estimated_delivery || '2024-06-15'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Assigned Warehouse: {group.supplier?.warehouse || 'WH-001'}</div>
              <div className="font-bold text-blue-600 mt-2">Supplier Subtotal: ${group.items.reduce((sum, item) => sum + (item.price - (item.price * (item.discount || 0) / 100)) * item.quantity, 0).toFixed(2)}</div>
            </div>
          ))}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
            <div className="font-semibold mb-2 dark:text-white">Shipping & Contact Information</div>
            <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">Address: {order.shipping_address || '16 Garden Street, Cairo'}</div>
            <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">Phone: {order.shipping_phone || '+201234567890'}</div>
            <div className="text-sm text-gray-700 dark:text-gray-200">Contact: {order.contact_name || 'Ahmed Youssef'}</div>
          </div>
        </div>
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-4">
            <div className="font-semibold mb-2">Order Total</div>
            <div className="flex justify-between text-sm mb-2">
              <span>Items Total:</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Delivery Fees:</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Final Amount Paid:</span>
              <span className="text-blue-600">${finalAmount.toFixed(2)}</span>
            </div>
            <Link to={`/client/dashboard/orders/${order.id}`} className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg mb-2 text-center">Track this Order</Link>
            <Link to="/client/dashboard/my-marketplace" className="w-full block bg-gray-200 text-gray-700 rounded-lg py-2 font-semibold mt-2 text-center">Continue Shopping</Link>
            <button className="w-full bg-gray-100 text-gray-700 rounded-lg py-2 font-semibold mt-2" disabled>Download Invoice</button>
          </div>
        </div>
      </div>
    </div>
  );
} 