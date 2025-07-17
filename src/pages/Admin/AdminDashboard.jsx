import React, { useEffect, useState } from 'react';
import Sidebar from '../../UI/admin/Sidebar';
import Topbar from '../../UI/admin/Topbar';
import ProfileCard from '../../UI/admin/ProfileCard';
import AdminsTable from '../../UI/admin/AdminsTable';
import Categories from './Categories';
import Governates from './Governates';
import Areas from './Areas';
import SuppliersTable from '../../UI/admin/SuppliersTable';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { get } from '../../utils/api';

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // NEW

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const data = await get('/api/v1/profile', { token });
        setProfile(data.data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchProfile();
  }, [token]);

  // Determine current tab for topbar title
  let title = 'Profile';
  if (location.pathname.endsWith('/admins')) title = 'Admins';
  if (location.pathname.endsWith('/suppliers')) title = 'Suppliers';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Topbar always on top */}
      <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 flex flex-row">
        {/* Sidebar overlays on mobile, static on desktop */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* Main content area */}
        <main className="flex-1 transition-all duration-300 pt-16 md:pl-64 px-2 md:px-8 relative z-0">
          <Routes>
            <Route index element={<Navigate to="profile" replace />} />
            <Route
              path="profile"
              element={
                <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-inner p-8">
                  <div className="flex justify-center w-full">
                    {loading ? (
                      <div className="text-gray-500">Loading...</div>
                    ) : profile ? (
                      <ProfileCard
                        name={profile.name}
                        email={profile.email}
                        phone={profile.phone}
                        onLogout={logout}
                      />
                    ) : (
                      <div className="text-red-500">Failed to load profile.</div>
                    )}
                  </div>
                </div>
              }
            />
            <Route
              path="admins"
              element={
                <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-inner p-8">
                  <div className="flex justify-center w-full">
                    <AdminsTable token={token} />
                  </div>
                </div>
              }
            />
            <Route
              path="suppliers"
              element={
                <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-inner p-8">
                  <div className="flex justify-center w-full">
                    <SuppliersTable token={token} />
                  </div>
                </div>
              }
            />
            <Route
              path="categories"
              element={<Categories />}
            />
            <Route
              path="governates"
              element={<Governates />}
            />
            <Route
              path="areas"
              element={<Areas />}
            />
            {/* Placeholder for suppliers tab */}
            <Route path="*" element={<Navigate to="profile" replace />} />
          </Routes>
        </main>
      </div>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
} 