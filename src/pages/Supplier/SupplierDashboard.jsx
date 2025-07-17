import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../../UI/supplier/Sidebar';
import Topbar from '../../UI/supplier/Topbar';
import SupplierProfile from '../Auth/Supplier/SupplierProfile';
import Products from './Products';
import Warehouses from './Warehouses';
import ShippingPeople from './ShippingPeople';

export default function SupplierDashboard() {
  const location = useLocation();
  let title = 'Profile';
  if (location.pathname.endsWith('/products')) title = 'Product Management';
  if (location.pathname.endsWith('/profile')) title = 'Profile';
  if (location.pathname.endsWith('/warehouses')) title = 'Warehouses';
  if (location.pathname.endsWith('/shipping-people')) title = 'Delivery Personnel';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex">
      <Sidebar />
      <div className="flex-1 min-h-screen ml-64">
        <Topbar title={title} />
        <main className="pt-20 px-8 pb-8">
          <Routes>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<SupplierProfile />} />
            <Route path="products" element={<Products />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="shipping-people" element={<ShippingPeople />} />
            <Route path="*" element={<Navigate to="profile" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
} 