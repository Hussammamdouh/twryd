import React, { useEffect, useState } from 'react';
import AdminFormModal from './AdminFormModal';
import { get, post, put, del } from '../../utils/api';
import { useToast } from '../Common/ToastContext';

function RoleBadge({ role }) {
  const color = role === 'superadmin' 
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
    : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{role}</span>;
}

function StatusBadge({ isActive }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
      isActive 
        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
        : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

const AdminsTable = function AdminsTable({ token }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const toast = useToast();

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await get('/api/v1/admins', { token });
      setAdmins(data.data);
    } catch (err) {
      toast.show(err.message, 'error');
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
    // Optimistic UI: remove admin immediately
    const prevAdmins = admins;
    setAdmins(admins.filter(a => a.id !== admin.id));
    try {
      await del(`/api/v1/admins/${admin.id}`, { token });
      toast.show('Admin deleted', 'success');
    } catch (err) {
      setAdmins(prevAdmins); // revert
      toast.show(err.message, 'error');
    }
  };

  const handleSubmit = async (form) => {
    if (isEdit && editAdmin) {
      // Optimistic UI: update admin in local state
      const prevAdmins = admins;
      setAdmins(admins.map(a => a.id === editAdmin.id ? { ...a, ...form } : a));
      try {
        await put(`/api/v1/admins/${editAdmin.id}`, { token, data: {
            name: form.name,
            phone: form.phone,
            is_active: form.is_active,
            role: form.role,
          }
        });
        toast.show('Admin updated', 'success');
      } catch (err) {
        setAdmins(prevAdmins); // revert
        toast.show(err.message, 'error');
      }
    } else {
      // Optimistic UI: add admin to local state
      const tempId = Math.random().toString(36).slice(2);
      const newAdmin = { ...form, id: tempId };
      const prevAdmins = admins;
      setAdmins([newAdmin, ...admins]);
      try {
        const res = await post('/api/v1/admins', { token, data: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            password_confirmation: form.password_confirmation,
            role: form.role,
            is_active: form.is_active,
          }
        });
        // Replace temp admin with real one from server
        setAdmins(admins => [res.data, ...admins.filter(a => a.id !== tempId)]);
        toast.show('Admin created', 'success');
      } catch (err) {
        setAdmins(prevAdmins); // revert
        toast.show(err.message, 'error');
      }
    }
  };

  return (
    <div className="theme-card p-3 sm:p-8 flex flex-col gap-4 max-w-4xl relative w-full mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2 sm:gap-0">
        <div className="text-xl sm:text-2xl font-bold text-primary-700">Manage Admins</div>
        <button
          onClick={handleAdd}
          className="theme-button px-3 sm:px-4 py-2 font-bold rounded-lg shadow-lg transition hidden sm:block"
          title="Add New Admin"
        >
          <span className="inline-block align-middle mr-2">+</span> Add New Admin
        </button>
      </div>
      <div className="border-t border-theme-border mb-2 sm:mb-4" />
      <div className="theme-table overflow-x-auto rounded-lg">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="theme-table-header text-primary-700 text-xs sm:text-base font-semibold">
              <th className="px-2 sm:px-4 py-2 text-left">Name</th>
              <th className="px-2 sm:px-4 py-2 text-left">Email</th>
              <th className="px-2 sm:px-4 py-2 text-left">Phone</th>
              <th className="px-2 sm:px-4 py-2 text-left">Role</th>
              <th className="px-2 sm:px-4 py-2 text-left">Status</th>
              <th className="px-2 sm:px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-6 text-theme-text-secondary">Loading...</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6 text-theme-text-muted">No admins found.</td></tr>
            ) : (
              admins.map((admin, idx) => (
                <tr key={admin.id} className={`border-b border-theme-border last:border-b-0 ${idx % 2 === 0 ? 'bg-theme-surface' : 'bg-theme-card'} hover:bg-theme-surface transition`}>
                  <td className="px-2 sm:px-4 py-2 font-medium text-theme-text text-xs sm:text-base">{admin.name}</td>
                  <td className="px-2 sm:px-4 py-2 break-all text-theme-text">{admin.email}</td>
                  <td className="px-2 sm:px-4 py-2 text-theme-text">{admin.phone}</td>
                  <td className="px-2 sm:px-4 py-2"><RoleBadge role={admin.role} /></td>
                  <td className="px-2 sm:px-4 py-2"><StatusBadge isActive={admin.is_active} /></td>
                  <td className="px-2 sm:px-4 py-2 flex gap-1 sm:gap-2 flex-wrap">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="p-1 sm:p-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-full transition shadow focus:ring-2 focus:ring-primary-400 text-xs sm:text-sm"
                      title="Edit Admin"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.914l-9.193 9.193-3.06.34a.75.75 0 0 1-.83-.83l.34-3.06 9.193-9.193Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(admin)}
                      className="p-1 sm:p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition shadow focus:ring-2 focus:ring-red-400 text-xs sm:text-sm"
                      title="Delete Admin"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
        className="sm:hidden fixed bottom-8 right-8 theme-button rounded-full shadow-lg p-4 text-2xl z-30 hover:scale-105 transition"
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

export default React.memo(AdminsTable); 