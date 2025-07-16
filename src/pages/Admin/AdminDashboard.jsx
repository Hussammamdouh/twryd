import React, { useEffect, useState } from 'react';
import Sidebar from '../../UI/admin/Sidebar';
import Topbar from '../../UI/admin/Topbar';
import ProfileCard from '../../UI/admin/ProfileCard';
import AdminsTable from '../../UI/admin/AdminsTable';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { get } from '../../utils/api';

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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
    <div className="min-h-screen bg-white">
      <Sidebar />
      <Topbar title={title} />
      <main className="pl-64 pt-20 pr-8">
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
          {/* Placeholder for suppliers tab */}
          <Route path="*" element={<Navigate to="profile" replace />} />
        </Routes>
      </main>
    </div>
  );
} 