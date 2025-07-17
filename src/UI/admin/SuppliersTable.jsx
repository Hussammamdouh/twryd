import React, { useEffect, useState } from 'react';
import { get, post, del } from '../../utils/api';
import { useToast } from '../Common/ToastContext';

export default function SuppliersTable({ token }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get('/api/v1/suppliers', { token });
      // Robust extraction logic
      const suppliersArr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setSuppliers(suppliersArr);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
      toast.show(err.message || 'Failed to load suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSuppliers();
  }, [token]);

  // Placeholder for actions: approve, reject, toggle status, verify email, delete
  const handleApprove = async (supplier) => {
    try {
      await post(`/api/v1/suppliers/${supplier.id}/approve`, { token });
      toast.show('Supplier approved', 'success');
      fetchSuppliers();
    } catch (err) {
      toast.show(err.message || 'Failed to approve', 'error');
    }
  };
  const handleReject = async (supplier) => {
    try {
      await post(`/api/v1/suppliers/${supplier.id}/reject`, { token });
      toast.show('Supplier rejected', 'success');
      fetchSuppliers();
    } catch (err) {
      toast.show(err.message || 'Failed to reject', 'error');
    }
  };
  const handleToggleStatus = async (supplier) => {
    try {
      await post(`/api/v1/suppliers/${supplier.id}/toggle-status`, { token });
      toast.show('Status toggled', 'success');
      fetchSuppliers();
    } catch (err) {
      toast.show(err.message || 'Failed to toggle status', 'error');
    }
  };
  const handleVerifyEmail = async (supplier) => {
    try {
      await post(`/api/v1/suppliers/${supplier.id}/verify-email`, { token });
      toast.show('Email verified', 'success');
      fetchSuppliers();
    } catch (err) {
      toast.show(err.message || 'Failed to verify email', 'error');
    }
  };
  const handleDelete = async (supplier) => {
    if (!window.confirm(`Delete supplier ${supplier.name}?`)) return;
    try {
      await del(`/api/v1/suppliers/${supplier.id}`, { token });
      toast.show('Supplier deleted', 'success');
      fetchSuppliers();
    } catch (err) {
      toast.show(err.message || 'Failed to delete', 'error');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8 px-1 sm:px-2 md:px-0">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-8 text-blue-700 flex items-center gap-2 drop-shadow-sm">
        <span className="inline-block bg-blue-100 text-blue-600 rounded-full px-2 sm:px-3 py-1 text-base sm:text-lg shadow">Suppliers</span>
        <span className="text-gray-400 font-normal text-base sm:text-lg">Management</span>
      </h1>
      <div className="bg-white rounded-2xl shadow-2xl p-3 sm:p-6 md:p-10 border border-gray-100">
        <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-blue-50 text-blue-700 text-xs sm:text-base font-semibold">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Logo</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Name</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Email</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Phone</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 sm:py-12 text-gray-500">Loading suppliers...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="text-center py-8 sm:py-12 text-red-500">{error}</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 sm:py-12 text-gray-400">No suppliers found.</td></tr>
              ) : (
                suppliers.map((supplier, idx) => (
                  <tr key={supplier.id} className={`border-b last:border-b-0 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition group`}>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      {supplier.logo ? (
                        <img src={supplier.logo.startsWith('http') ? supplier.logo : `https://back.twryd.com/${supplier.logo}`} alt={supplier.name} className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-full border border-gray-200 shadow" />
                      ) : (
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">N/A</div>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-900 text-xs sm:text-base">{supplier.name}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 break-all">{supplier.email}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">{supplier.phone}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {supplier.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 flex gap-1 sm:gap-2 flex-wrap">
                      <button onClick={() => handleApprove(supplier)} className="flex items-center gap-1 p-1 sm:p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition shadow text-xs sm:text-sm" title="Approve">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span className="hidden md:inline text-xs font-semibold">Approve</span>
                      </button>
                      <button onClick={() => handleReject(supplier)} className="flex items-center gap-1 p-1 sm:p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full transition shadow text-xs sm:text-sm" title="Reject">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        <span className="hidden md:inline text-xs font-semibold">Reject</span>
                      </button>
                      <span className="w-px h-6 bg-gray-200 mx-1 hidden md:inline-block" />
                      <button onClick={() => handleToggleStatus(supplier)} className="flex items-center gap-1 p-1 sm:p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition shadow text-xs sm:text-sm" title="Toggle Status">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        <span className="hidden md:inline text-xs font-semibold">Toggle</span>
                      </button>
                      <button onClick={() => handleVerifyEmail(supplier)} className="flex items-center gap-1 p-1 sm:p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition shadow text-xs sm:text-sm" title="Verify Email">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M16 12H8m4-4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        <span className="hidden md:inline text-xs font-semibold">Verify</span>
                      </button>
                      <span className="w-px h-6 bg-gray-200 mx-1 hidden md:inline-block" />
                      <button onClick={() => handleDelete(supplier)} className="flex items-center gap-1 p-1 sm:p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition shadow text-xs sm:text-sm" title="Delete">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span className="hidden md:inline text-xs font-semibold">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 