import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../UI/Common/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { get, post, put, del } from '../../../utils/api';
import AdminsPageHeader from './AdminsPageHeader';
import AdminsStatsCards from './AdminsStatsCards';
import AdminsTable from './AdminsTable';
import AdminFormModal from '../../../UI/admin/AdminFormModal';

export default function AdminsManagement() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  
  // State management
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('table');

  // Fetch admins data
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get('/api/v1/admins', { token });
      setAdmins(data.data);
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) fetchAdmins();
  }, [token, fetchAdmins]);

  // Calculate stats
  const stats = useMemo(() => [
    {
      id: 1,
      title: t('administrators.stats.total'),
      value: admins.length,
      change: '+12%',
      changeType: 'positive',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBgGradient: 'from-blue-900/20 to-blue-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: t('administrators.stats.active'),
      value: admins.filter(admin => admin.is_active).length,
      change: '+8%',
      changeType: 'positive',
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      darkBgGradient: 'from-emerald-900/20 to-emerald-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: t('administrators.stats.super_admins'),
      value: admins.filter(admin => admin.role === 'superadmin').length,
      change: '+3%',
      changeType: 'positive',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      darkBgGradient: 'from-purple-900/20 to-purple-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 4,
      title: t('administrators.stats.inactive'),
      value: admins.filter(admin => !admin.is_active).length,
      change: '-5%',
      changeType: 'negative',
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      darkBgGradient: 'from-red-900/20 to-red-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
        </svg>
      )
    }
  ], [admins]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = admins.filter(admin => {
      const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           admin.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'active' && admin.is_active) ||
                           (selectedStatus === 'inactive' && !admin.is_active);
      const matchesRole = selectedRole === 'all' || admin.role === selectedRole;
      return matchesSearch && matchesStatus && matchesRole;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [admins, searchTerm, selectedStatus, selectedRole, sortBy, sortOrder]);

  // Event handlers
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const handleAdd = useCallback(() => {
    setEditAdmin(null);
    setIsEdit(false);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((admin) => {
    setEditAdmin(admin);
    setIsEdit(true);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (admin) => {
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
  }, [admins, token, toast, t]);

  const handleSubmit = useCallback(async (form) => {
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
        setModalOpen(false);
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
        setModalOpen(false);
      } catch (err) {
        // Revert by removing the temp admin
        setAdmins(admins => admins.filter(a => a.id !== tempId));
        toast.show(err.message, 'error');
      }
    }
  }, [isEdit, editAdmin, token, toast, t]);

  const handleAction = useCallback((action, admin) => {
    switch (action) {
      case 'edit':
        handleEdit(admin);
        break;
      case 'delete':
        handleDelete(admin);
        break;
      default:
        console.log(`${action} for ${admin.name}`);
    }
  }, [handleEdit, handleDelete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <AdminsPageHeader onAdd={handleAdd} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Stats Cards Section */}
        <div className="mb-10 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {t('nav.administrators')} Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg max-w-2xl">
                {t('administrators.description')}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span>{t('common.active')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{t('common.inactive')}</span>
                </div>
              </div>
            </div>
          </div>
          <AdminsStatsCards stats={stats} />
        </div>
        
        {/* Admins Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="space-y-2">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {t('nav.administrators')} Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  {t('administrators.description')}
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('administrators.showing', { from: filteredData.length, to: filteredData.length, total: admins.length })}</span>
                </div>
                <button 
                  onClick={handleAdd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('administrators.add')}
                </button>
              </div>
            </div>
            
            <AdminsTable
              data={filteredData}
              totalData={admins}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onAction={handleAction}
            />
          </div>
        </div>
      </div>

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