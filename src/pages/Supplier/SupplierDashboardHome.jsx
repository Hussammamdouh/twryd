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
    <div className="min-h-screen bg-theme-bg">
      <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-theme-text mb-4 sm:mb-6">Dashboard Overview</h1>
          
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <div className="theme-card p-4 sm:p-6 flex flex-col items-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">${stats.totalSales.toLocaleString()}</div>
              <div className="text-theme-text-secondary text-xs sm:text-sm mt-1 sm:mt-2">Total Sales</div>
            </div>
            <div className="theme-card p-4 sm:p-6 flex flex-col items-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalOrders}</div>
              <div className="text-theme-text-secondary text-xs sm:text-sm mt-1 sm:mt-2">Total Orders</div>
            </div>
            <div className="theme-card p-4 sm:p-6 flex flex-col items-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-300">{stats.pendingOrders}</div>
              <div className="text-theme-text-secondary text-xs sm:text-sm mt-1 sm:mt-2">Pending Orders</div>
            </div>
            <div className="theme-card p-4 sm:p-6 flex flex-col items-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.deliveredOrders}</div>
              <div className="text-theme-text-secondary text-xs sm:text-sm mt-1 sm:mt-2">Delivered Orders</div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            <div className="theme-card p-4 sm:p-6">
              <div className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-theme-text">Sales Over Time</div>
              <SimpleBarChart data={stats.salesOverTime} label="Sales" />
            </div>
            <div className="theme-card p-4 sm:p-6">
              <div className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-theme-text">Top Products</div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.topProducts.map((p, i) => (
                  <li key={i} className="py-2 sm:py-3 flex justify-between items-center">
                    <span className="text-theme-text text-sm sm:text-base">{p.name}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base">{p.sales}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <Link to="/supplier/dashboard/products" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg transition-all duration-200">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
            <Link to="/supplier/dashboard/orders" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg transition-all duration-200">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M5 7h14l1 5H4l1-5zm2 8a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
              </svg>
              View Orders
            </Link>
            <Link to="/supplier/invitations" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg transition-all duration-200 sm:col-span-2 lg:col-span-1">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" />
              </svg>
              Invite Client
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 