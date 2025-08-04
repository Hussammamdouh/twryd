import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { downloadOrderPDF } from '../../utils/pdfUtils';
import Spinner from '../../UI/supplier/Spinner';

export default function ClientOrderConfirmation() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Group items by supplier (hook must be unconditional)
  const grouped = React.useMemo(() => {
    if (!order || !order.items) return [];
    
    // Since all items in an order belong to the same supplier, we can group them together
    // using the order-level supplier information
    return [{
      supplier_id: order.supplier_id,
      supplier: order.supplier,
      items: order.items
    }];
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

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!order) return;
    
    setDownloading(true);
    try {
      await downloadOrderPDF(order, 'client');
      toast.show('Invoice downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.show('Failed to download invoice. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!order) return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-24">
      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 mb-1 sm:mb-2">Order not found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">We couldn't find your order. Please check your order ID or contact support.</p>
      <Link to="/client/dashboard/orders" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold text-sm sm:text-base">Go to Orders</Link>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg sm:rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="text-gray-900 dark:text-white">Order Confirmed!</span>
              <span className="text-gray-500 dark:text-gray-400 font-normal text-base sm:text-lg lg:text-xl ml-0 sm:ml-2">Thank you for your purchase</span>
            </div>
          </div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">A confirmation email has been sent. You can track your order in your dashboard.</p>
        <div className="bg-white dark:bg-gray-800 rounded-lg px-3 sm:px-4 py-2 border border-gray-200 dark:border-gray-700 mt-3 sm:mt-4 inline-block">
          <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Order #{order.order_number || order.id}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Order Summary
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              {grouped.map(group => (
                <div key={group.supplier_id} className="mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">{group.supplier?.name || 'Supplier'}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{group.supplier?.email || ''}</p>
                      {group.supplier?.phone && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Phone: {group.supplier.phone}</p>
                      )}
                      {group.supplier?.address && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Address: {group.supplier.address}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm mb-3 sm:mb-4">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          <th className="text-left p-3 font-semibold">Product</th>
                          <th className="p-3 text-center font-semibold">Quantity</th>
                          <th className="p-3 text-center font-semibold">Price</th>
                          <th className="p-3 text-center font-semibold">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map(item => (
                          <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="p-3 text-gray-900 dark:text-white font-medium">{item.product?.name || item.name || 'Unknown Product'}</td>
                            <td className="p-3 text-center text-gray-900 dark:text-white">{item.quantity || 0}</td>
                            <td className="p-3 text-center text-gray-900 dark:text-white">${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                            <td className="p-3 text-center font-semibold text-primary-600 dark:text-primary-400">${parseFloat(item.total || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3 mb-3 sm:mb-4">
                    {group.items.map(item => (
                      <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                        <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base mb-2">{item.product?.name || item.name || 'Unknown Product'}</div>
                        <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                          <div className="text-center">
                            <div className="text-gray-500 dark:text-gray-400">Qty</div>
                            <div className="font-medium text-gray-900 dark:text-white">{item.quantity || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500 dark:text-gray-400">Price</div>
                            <div className="text-gray-900 dark:text-white">${parseFloat(item.unit_price || 0).toFixed(2)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500 dark:text-gray-400">Subtotal</div>
                            <div className="font-semibold text-primary-600 dark:text-primary-400">${parseFloat(item.total || 0).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Delivery Method</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{group.supplier?.delivery_method || 'Standard'}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Estimated Delivery</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{group.supplier?.estimated_delivery || '2024-06-15'}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Assigned Warehouse</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{group.supplier?.warehouse || 'WH-001'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">Supplier Subtotal: ${group.items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2)}</div>
                  </div>
                </div>
              ))}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
                <div className="font-semibold mb-2 text-gray-900 dark:text-white text-sm sm:text-base">Shipping & Contact Information</div>
                <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 mb-1">Address: {order.shipping_address || '16 Garden Street, Cairo'}</div>
                <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 mb-1">Phone: {order.shipping_phone || '+201234567890'}</div>
                <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">Contact: {order.contact_name || 'Ahmed Youssef'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Order Total
              </h3>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Items Total:</span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">${orderTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Delivery Fees:</span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg px-3">
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Final Amount:</span>
                <span className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">${finalAmount.toFixed(2)}</span>
              </div>
              <div className="space-y-3 pt-3 sm:pt-4">
                <Link to={`/client/dashboard/orders/${order.id}`} className="w-full block bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 text-center flex items-center justify-center gap-2 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Track this Order
                </Link>
                <Link to="/client/dashboard/my-marketplace" className="w-full block bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 dark:text-gray-300 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-lg sm:rounded-xl py-2 sm:py-3 font-semibold transition-all duration-200 text-center flex items-center justify-center gap-2 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M5 7h14l1 5H4l1-5zm2 8a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
                  </svg>
                  Continue Shopping
                </Link>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-500 dark:text-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg sm:rounded-xl py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base" disabled={downloading} onClick={handleDownloadPDF}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {downloading ? 'Downloading...' : 'Download Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 