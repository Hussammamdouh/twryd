import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../UI/Common/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { get, post, put, del } from '../../../utils/api';
import SuppliersPageHeader from './SuppliersPageHeader';
import SuppliersStatsCards from './SuppliersStatsCards';
import SuppliersTable from './SuppliersTable';
import SupplierFormModal from '../../../UI/admin/SupplierFormModal';

export default function SuppliersManagement() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  
  // State management
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('table');

  // Fetch suppliers data
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get('/api/v1/suppliers', { token });
      setSuppliers(data.data);
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) fetchSuppliers();
  }, [token, fetchSuppliers]);

  // Calculate stats
  const stats = useMemo(() => [
    {
      id: 1,
      title: t('suppliers.stats.total'),
      value: suppliers.length,
      change: '+15%',
      changeType: 'positive',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBgGradient: 'from-blue-900/20 to-blue-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 2,
      title: t('suppliers.stats.active'),
      value: suppliers.filter(supplier => supplier.is_active).length,
      change: '+12%',
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
      title: t('suppliers.stats.premium'),
      value: suppliers.filter(supplier => supplier.subscription?.plan?.type === 'premium').length,
      change: '+8%',
      changeType: 'positive',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      darkBgGradient: 'from-purple-900/20 to-purple-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      id: 4,
      title: t('suppliers.stats.inactive'),
      value: suppliers.filter(supplier => !supplier.is_active).length,
      change: '-3%',
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
  ], [suppliers]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'active' && supplier.is_active) ||
                           (selectedStatus === 'inactive' && !supplier.is_active);
      const matchesCategory = selectedCategory === 'all' || supplier.category?.name === selectedCategory;
      return matchesSearch && matchesStatus && matchesCategory;
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
  }, [suppliers, searchTerm, selectedStatus, selectedCategory, sortBy, sortOrder]);

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
    setEditSupplier(null);
    setIsEdit(false);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((supplier) => {
    setEditSupplier(supplier);
    setIsEdit(true);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (supplier) => {
    if (!window.confirm(t('suppliers.delete_confirm', { name: supplier.name }))) return;
    
    // Optimistic UI: remove supplier immediately
    const prevSuppliers = suppliers;
    setSuppliers(suppliers.filter(s => s.id !== supplier.id));
    
    try {
      await del(`/api/v1/suppliers/${supplier.id}`, { token });
      toast.show(t('suppliers.deleted'), 'success');
    } catch (err) {
      setSuppliers(prevSuppliers); // revert
      toast.show(err.message, 'error');
    }
  }, [suppliers, token, toast, t]);

  const handleSubmit = useCallback(async (form) => {
    if (isEdit) {
      try {
        const res = await put(`/api/v1/suppliers/${editSupplier.id}`, {
          token,
          data: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            category_id: form.category_id,
            is_active: form.is_active,
          }
        });
        // Update supplier in list
        setSuppliers(suppliers => suppliers.map(s => s.id === editSupplier.id ? res.data : s));
        toast.show(t('suppliers.updated'), 'success');
        setModalOpen(false);
      } catch (err) {
        toast.show(err.message, 'error');
      }
    } else {
      // Optimistic UI: add temp supplier
      const tempId = Date.now();
      const tempSupplier = {
        id: tempId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        category: { name: form.category_name },
        is_active: form.is_active,
      };
      setSuppliers(suppliers => [tempSupplier, ...suppliers]);
      
      try {
        const res = await post('/api/v1/suppliers', {
          token,
          data: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            category_id: form.category_id,
            is_active: form.is_active,
          }
        });
        // Replace temp supplier with real one from server
        setSuppliers(suppliers => [res.data, ...suppliers.filter(s => s.id !== tempId)]);
        toast.show(t('suppliers.created'), 'success');
        setModalOpen(false);
      } catch (err) {
        // Revert by removing the temp supplier
        setSuppliers(suppliers => suppliers.filter(s => s.id !== tempId));
        toast.show(err.message, 'error');
      }
    }
  }, [isEdit, editSupplier, token, toast, t]);

  const handleAction = useCallback((action, supplier) => {
    switch (action) {
      case 'edit':
        handleEdit(supplier);
        break;
      case 'delete':
        handleDelete(supplier);
        break;
      default:
        console.log(`${action} for ${supplier.name}`);
    }
  }, [handleEdit, handleDelete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <SuppliersPageHeader onAdd={handleAdd} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Stats Cards Section */}
        <div className="mb-10 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {t('nav.suppliers')} Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg max-w-2xl">
                {t('suppliers.description')}
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
          <SuppliersStatsCards stats={stats} />
        </div>
        
        {/* Suppliers Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="space-y-2">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {t('nav.suppliers')} Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  {t('suppliers.description')}
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('suppliers.showing', { from: filteredData.length, to: filteredData.length, total: suppliers.length })}</span>
                </div>
                <button 
                  onClick={handleAdd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('suppliers.add')}
                </button>
              </div>
            </div>
            
            <SuppliersTable
              data={filteredData}
              totalData={suppliers}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
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

      <SupplierFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editSupplier}
        isEdit={isEdit}
        token={token}
      />
    </div>
  );
} 