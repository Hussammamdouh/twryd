import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../UI/supplier/Spinner';

// Placeholder for chart (replace with chart library if needed)
function SimpleBarChart({ data, label }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="w-full h-32 flex items-end gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            className="w-6 rounded-t bg-blue-500 dark:bg-blue-400"
            style={{ height: `${(d.value / max) * 80 + 10}px` }}
            title={d.value}
          ></div>
          <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function SupplierDashboardHome() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Fetch analytics (replace with real API if available)
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Replace with real API call if available
        // const res = await get('/api/supplier/analytics', { token });
        // setStats(res.data);
        setStats({
          totalSales: 12450,
          totalOrders: 320,
          pendingOrders: 12,
          deliveredOrders: 290,
          revenue: 10200,
          topProducts: [
            { name: 'Product A', sales: 120 },
            { name: 'Product B', sales: 90 },
            { name: 'Product C', sales: 70 },
          ],
          salesOverTime: [
            { label: 'Jan', value: 1200 },
            { label: 'Feb', value: 1500 },
            { label: 'Mar', value: 1800 },
            { label: 'Apr', value: 1100 },
            { label: 'May', value: 2100 },
            { label: 'Jun', value: 1750 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token]);

  if (loading || !stats) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold dark:text-white mb-6">Dashboard Overview</h1>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">${stats.totalSales.toLocaleString()}</div>
          <div className="text-gray-600 dark:text-gray-400 mt-2">Total Sales</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalOrders}</div>
          <div className="text-gray-600 dark:text-gray-400 mt-2">Total Orders</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{stats.pendingOrders}</div>
          <div className="text-gray-600 dark:text-gray-400 mt-2">Pending Orders</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.deliveredOrders}</div>
          <div className="text-gray-600 dark:text-gray-400 mt-2">Delivered Orders</div>
        </div>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="font-semibold text-lg mb-4 dark:text-white">Sales Over Time</div>
          <SimpleBarChart data={stats.salesOverTime} label="Sales" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="font-semibold text-lg mb-4 dark:text-white">Top Products</div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {stats.topProducts.map((p, i) => (
              <li key={i} className="py-2 flex justify-between items-center">
                <span className="dark:text-white">{p.name}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{p.sales}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/supplier/dashboard/products" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
        <Link to="/supplier/dashboard/orders" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M5 7h14l1 5H4l1-5zm2 8a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
          </svg>
          View Orders
        </Link>
        <Link to="/supplier/invitations" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" />
          </svg>
          Invite Client
        </Link>
      </div>
    </div>
  );
} 