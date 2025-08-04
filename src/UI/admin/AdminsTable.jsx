import React, { useEffect, useState } from 'react';
import AdminFormModal from './AdminFormModal';
import { get, post, put, del } from '../../utils/api';
import { useToast } from '../Common/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';

function RoleBadge({ role }) {
  const { t } = useLanguage();
  const color = role === 'superadmin' 
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
    : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';
  const roleText = role === 'superadmin' ? t('administrators.superadmin') : t('administrators.admin');
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{roleText}</span>;
}

function StatusBadge({ isActive }) {
  const { t } = useLanguage();
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
      isActive 
        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
        : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
    }`}>
      {isActive ? t('common.active') : t('common.inactive')}
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
  const { t } = useLanguage();

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
    if (!window.confirm(t('administrators.delete_confirm', { name: admin.name }))) return;
    // Optimistic UI: remove admin immediately
    const prevAdmins = admins;
    setAdmins(admins.filter(a => a.id !== admin.id));
    try {
      await del(`/api/v1/admins/${admin.id}`, { token });
      toast.show(t('administrators.deleted'), 'success');
    } catch (err) {
      setAdmins(prevAdmins); // revert
      toast.show(err.message, 'error');
    }
  };

  const handleSubmit = async (form) => {
    if (isEdit) {
      try {
        const res = await put(`/api/v1/admins/${editAdmin.id}`, {
          token,
          data: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            password_confirmation: form.password_confirmation,
            role: form.role,
            is_active: form.is_active,
          }
        });
        // Update admin in list
        setAdmins(admins => admins.map(a => a.id === editAdmin.id ? res.data : a));
        toast.show(t('administrators.updated'), 'success');
      } catch (err) {
        toast.show(err.message, 'error');
      }
    } else {
      // Optimistic UI: add temp admin
      const tempId = Date.now();
      const tempAdmin = {
        id: tempId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        is_active: form.is_active,
      };
              setAdmins(admins => [tempAdmin, ...admins]);
        try {
          const res = await post('/api/v1/admins', {
            token,
            data: {
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
          toast.show(t('administrators.created'), 'success');
        } catch (err) {
          // Revert by removing the temp admin
          setAdmins(admins => admins.filter(a => a.id !== tempId));
          toast.show(err.message, 'error');
        }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="theme-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-theme-text">{t('nav.administrators')}</h1>
            <p className="text-theme-text-secondary text-sm sm:text-base">{t('administrators.description')}</p>
          </div>
          <button
            onClick={handleAdd}
            className="theme-button px-3 sm:px-4 py-2 font-bold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 text-sm sm:text-base"
            title={t('administrators.add')}
          >
            <span className="inline-block align-middle mr-1 sm:mr-2">+</span> {t('administrators.add')}
          </button>
        </div>
      </div>

      <div className="theme-card p-2 sm:p-4">
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('common.name')}</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">{t('common.email')}</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">{t('common.phone')}</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('administrators.role')}</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">{t('common.status')}</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 sm:py-12">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('administrators.loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 sm:py-12">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-10 sm:w-12 h-10 sm:h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <div className="text-base sm:text-lg font-semibold text-gray-500 dark:text-gray-400">{t('administrators.no_administrators')}</div>
                      <p className="text-sm sm:text-base text-gray-400 dark:text-gray-500">{t('administrators.get_started')}</p>
                      <button
                        onClick={handleAdd}
                        className="px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 focus:bg-primary-800 text-white rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 transition-all duration-150 text-sm sm:text-base"
                      >
                        {t('administrators.add_administrator')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr 
                    key={admin.id} 
                    className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-2 sm:px-4 py-3 font-medium text-theme-text">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs sm:text-sm">
                          {admin.name ? admin.name[0].toUpperCase() : 'A'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{admin.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-theme-text break-all hidden sm:table-cell">{admin.email}</td>
                    <td className="px-2 sm:px-4 py-3 text-theme-text hidden lg:table-cell">{admin.phone}</td>
                    <td className="px-2 sm:px-4 py-3"><RoleBadge role={admin.role} /></td>
                    <td className="px-2 sm:px-4 py-3 hidden md:table-cell"><StatusBadge isActive={admin.is_active} /></td>
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="p-1.5 sm:p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[32px] sm:min-h-[36px]"
                          title={t('administrators.edit')}
                        >
                          <svg width="14" height="14" className="sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.914l-9.193 9.193-3.06.34a.75.75 0 0 1-.83-.83l.34-3.06 9.193-9.193Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(admin)}
                          className="p-1.5 sm:p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[32px] sm:min-h-[36px]"
                          title={t('administrators.delete')}
                        >
                          <svg width="14" height="14" className="sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating action button for mobile */}
      <button
        onClick={handleAdd}
        className="sm:hidden fixed bottom-6 right-6 theme-button rounded-full shadow-lg p-3 text-xl z-30 hover:scale-105 transition-all duration-200"
        title={t('administrators.add')}
        style={{ boxShadow: '0 4px 24px 0 rgba(59,130,246,0.25)' }}
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
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