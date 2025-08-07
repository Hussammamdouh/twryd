import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../UI/Common/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { get, post, put, del } from '../../../utils/api';
import CategoriesPageHeader from './CategoriesPageHeader';
import CategoriesStatsCards from './CategoriesStatsCards';
import CategoriesTable from './CategoriesTable';
import CategoryFormModal from './CategoryFormModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back.twryd.com';

function getIconUrl(icon) {
  if (!icon) return null;
  if (icon.startsWith('http')) return icon;
  const cleanPath = icon.replace(/^\//, '');
  return `${API_BASE_URL}/storage/${cleanPath}`;
}

export default function CategoriesManagement() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  
  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('table');

  // Fetch categories data
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get('/api/v1/manage-categories', { token });
      const cats = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const formattedCategories = cats.map(cat => ({
        ...cat,
        is_active: cat.is_active === true || cat.is_active === 1 || cat.is_active === '1'
      }));
      setCategories(formattedCategories);
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) fetchCategories();
  }, [token, fetchCategories]);

  // Calculate stats
  const stats = useMemo(() => [
    {
      id: 1,
      title: t('categories.stats.total'),
      value: categories.length,
      change: '+8%',
      changeType: 'positive',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBgGradient: 'from-blue-900/20 to-blue-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      id: 2,
      title: t('categories.stats.active'),
      value: categories.filter(cat => cat.is_active).length,
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
      title: t('categories.stats.with_icons'),
      value: categories.filter(cat => cat.icon).length,
      change: '+5%',
      changeType: 'positive',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      darkBgGradient: 'from-purple-900/20 to-purple-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 4,
      title: t('categories.stats.inactive'),
      value: categories.filter(cat => !cat.is_active).length,
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
  ], [categories, t]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = categories;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cat =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.name_ar?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(cat => {
        if (selectedStatus === 'active') return cat.is_active;
        if (selectedStatus === 'inactive') return !cat.is_active;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'name') {
        aValue = a.name?.toLowerCase() || '';
        bValue = b.name?.toLowerCase() || '';
      } else if (sortBy === 'name_ar') {
        aValue = a.name_ar?.toLowerCase() || '';
        bValue = b.name_ar?.toLowerCase() || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [categories, searchTerm, selectedStatus, sortBy, sortOrder]);

  // Handlers
  const handleAdd = useCallback(() => {
    setEditData(null);
    setIsEdit(false);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((category) => {
    setEditData(category);
    setIsEdit(true);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback((category) => {
    setDeleteTarget(category);
    setDeleteModalOpen(true);
  }, []);

  const handleToggleStatus = useCallback(async (category) => {
    try {
      const updatedCategory = { ...category, is_active: !category.is_active };
      await put(`/api/v1/manage-categories/${category.id}`, updatedCategory, { token });
      
      setCategories(prev => prev.map(cat => 
        cat.id === category.id ? updatedCategory : cat
      ));
      
      toast.show(t('categories.status_updated'), 'success');
    } catch (err) {
      toast.show(err.message, 'error');
    }
  }, [token, toast, t]);

  const handleSubmit = useCallback(async (formData) => {
    try {
      if (isEdit) {
        await put(`/api/v1/manage-categories/${editData.id}`, formData, { token });
        setCategories(prev => prev.map(cat => 
          cat.id === editData.id ? { ...cat, ...formData } : cat
        ));
        toast.show(t('categories.updated'), 'success');
      } else {
        const newCategory = await post('/api/v1/manage-categories', formData, { token });
        setCategories(prev => [...prev, newCategory.data]);
        toast.show(t('categories.created'), 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast.show(err.message, 'error');
    }
  }, [isEdit, editData, token, toast, t]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    
    setDeleteLoading(true);
    try {
      await del(`/api/v1/manage-categories/${deleteTarget.id}`, { token });
      setCategories(prev => prev.filter(cat => cat.id !== deleteTarget.id));
      toast.show(t('categories.deleted'), 'success');
      setDeleteModalOpen(false);
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, token, toast, t]);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const handleExport = useCallback(() => {
    // Export functionality
    console.log('Export categories');
  }, []);

  const handleAction = useCallback((action, category) => {
    switch (action) {
      case 'edit':
        handleEdit(category);
        break;
      case 'delete':
        handleDelete(category);
        break;
      case 'toggle_status':
        handleToggleStatus(category);
        break;
      default:
        console.log(`${action} for ${category.name}`);
    }
  }, [handleEdit, handleDelete, handleToggleStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
        <div className="animate-pulse">
          <div className="h-48 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800"></div>
          <div className="px-6 lg:px-8 -mt-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <CategoriesPageHeader onAdd={handleAdd} onExport={handleExport} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Stats Cards Section */}
        <div className="mb-10 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {t('nav.categories')} Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg max-w-2xl">
                {t('categories.description')}
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
          <CategoriesStatsCards stats={stats} />
        </div>
        
        {/* Categories Table Section */}
        <div className="mb-10 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="space-y-2">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {t('nav.categories')} Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                {t('categories.description')}
              </p>
            </div>
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('categories.showing', { from: filteredAndSortedData.length, to: filteredAndSortedData.length, total: categories.length })}</span>
              </div>
              <button 
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('categories.add')}
              </button>
            </div>
          </div>
          
          <CategoriesTable
            data={filteredAndSortedData}
            totalData={categories}
            isLoading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            sortBy={sortBy}
            sortOrder={sortOrder}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onSort={handleSort}
            onAction={handleAction}
            getIconUrl={getIconUrl}
          />
        </div>
      </div>
      
      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editData}
        isEdit={isEdit}
      />
      
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        categoryName={deleteTarget?.name}
        loading={deleteLoading}
      />
    </div>
  );
} 