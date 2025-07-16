import React, { useEffect, useState } from 'react';
import AdminFormModal from './AdminFormModal';
import toast from 'react-hot-toast';
import { get, post, put, del } from '../../utils/api';

function RoleBadge({ role }) {
  const color = role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{role}</span>;
}

function StatusBadge({ isActive }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function AdminsTable({ token }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await get('/api/v1/admins', { token });
      setAdmins(data.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAdmins();
    // eslint-disable-next-line
  }, [token]);

  const handleAdd = () => {
    setEditAdmin(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (admin) => {
    setEditAdmin(admin);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Delete admin ${admin.name}?`)) return;
    try {
      await del(`/api/v1/admins/${admin.id}`, { token });
      toast.success('Admin deleted');
      fetchAdmins();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (form) => {
    if (isEdit && editAdmin) {
      // Update admin
      await put(`/api/v1/admins/${editAdmin.id}`, { token, data: {
          name: form.name,
          phone: form.phone,
          is_active: form.is_active,
          role: form.role,
        }
      });
      toast.success('Admin updated');
      fetchAdmins();
    } else {
      // Create admin
      await post('/api/v1/admins', { token, data: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          password_confirmation: form.password_confirmation,
          role: form.role,
          is_active: form.is_active,
        }
      });
      toast.success('Admin created');
      fetchAdmins();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col gap-4 max-w-4xl border border-gray-100 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold text-blue-700">Manage Admins</div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg transition hidden sm:block"
          title="Add New Admin"
        >
          <span className="inline-block align-middle mr-2">+</span> Add New Admin
        </button>
      </div>
      <div className="border-t border-gray-100 mb-4" />
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-blue-50 text-blue-700 text-base font-semibold">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-6">Loading...</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6">No admins found.</td></tr>
            ) : (
              admins.map((admin, idx) => (
                <tr key={admin.id} className={`border-b last:border-b-0 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`}>
                  <td className="px-4 py-2 font-medium text-gray-900">{admin.name}</td>
                  <td className="px-4 py-2">{admin.email}</td>
                  <td className="px-4 py-2">{admin.phone}</td>
                  <td className="px-4 py-2"><RoleBadge role={admin.role} /></td>
                  <td className="px-4 py-2"><StatusBadge isActive={admin.is_active} /></td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition shadow focus:ring-2 focus:ring-blue-400"
                      title="Edit Admin"
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.914l-9.193 9.193-3.06.34a.75.75 0 0 1-.83-.83l.34-3.06 9.193-9.193Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(admin)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition shadow focus:ring-2 focus:ring-red-400"
                      title="Delete Admin"
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Floating action button for mobile */}
      <button
        onClick={handleAdd}
        className="sm:hidden fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full shadow-lg p-4 text-2xl z-30 hover:scale-105 transition"
        title="Add New Admin"
        style={{ boxShadow: '0 4px 24px 0 rgba(59,130,246,0.25)' }}
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editAdmin}
        isEdit={isEdit}
        token={token}
      />
    </div>
  );
} 