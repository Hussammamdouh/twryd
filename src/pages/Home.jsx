import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../UI/Common/ToastContext';

export default function Home() {
  const { token, logout } = useAuth();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.show('Logged out successfully!', 'success');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5]">
      <h1 className="text-3xl font-bold mb-6">Welcome to Twryd Home</h1>
      {token && (
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-gradient-to-r from-[#0099FF] to-[#1E90FF] text-white font-bold rounded-lg shadow hover:scale-105 transition mb-4"
        >
          Logout
        </button>
      )}
      <p className="text-gray-600">This is the home page.</p>
    </div>
  );
}