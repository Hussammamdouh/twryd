import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { get, post, put, del } from '../../utils/api';
import PlansTable from '../../UI/admin/PlansTable';
import PlanFormModal from '../../UI/admin/PlanFormModal';
import Pagination from '../../UI/supplier/Pagination';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import { useLayout } from '../../hooks/useLayout';

export default function PlansManagement() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const { sidebarCollapsed } = useLayout();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, standard, custom
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [actionResult, setActionResult] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  // Fetch plans
  const fetchPlans = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await get(`/api/admin/plans?page=${pageNum}&per_page=10`, { token });
      const data = res.data?.plans?.data || res.data?.plans || res.data || [];
      setPlans(data);
      setTotalPages(res.data?.plans?.last_page || 1);
    } catch (err) {
      console.error('Failed to load plans:', err.message);
      toast.show(err.message || t('plans.loading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPlans(page);
  }, [token, page]);

  // Filter plans
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      const matchesSearch = !search || 
        plan.name?.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
        (filter === 'standard' && !plan.is_custom) ||
        (filter === 'custom' && plan.is_custom);
      
      return matchesSearch && matchesFilter;
    });
  }, [plans, search, filter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = plans.length;
    const active = plans.filter(plan => plan.is_active).length;
    const standard = plans.filter(plan => !plan.is_custom).length;
    const custom = plans.filter(plan => plan.is_custom).length;
    const totalRevenue = plans.reduce((sum, plan) => sum + (plan.price_per_month || 0), 0);

    return { total, active, standard, custom, totalRevenue };
  }, [plans]);

  // Handle add plan
  const handleAdd = () => {
    setEditPlan(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  // Handle edit plan
  const handleEdit = (plan) => {
    setEditPlan(plan);
    setIsEdit(true);
    setModalOpen(true);
  };

  // Handle delete plan
  const handleDelete = async (plan) => {
    setRowLoading(l => ({ ...l, [plan.id]: true }));
    try {
      await del(`/api/admin/plans/${plan.id}`, { token });
      setRecentlyUpdated(prev => ({ ...prev, [plan.id]: true }));
      setActionResult(prev => ({ ...prev, [plan.id]: 'success' }));
      toast.show(t('plans.deleted'), 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [plan.id]: false }));
        setActionResult(prev => ({ ...prev, [plan.id]: undefined }));
      }, 2000);
      fetchPlans(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [plan.id]: true }));
      setActionResult(prev => ({ ...prev, [plan.id]: 'error' }));
      toast.show(err.message || t('messages.operation_failed'), 'error');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [plan.id]: false }));
        setActionResult(prev => ({ ...prev, [plan.id]: undefined }));
      }, 2000);
    } finally {
      setRowLoading(l => ({ ...l, [plan.id]: false }));
    }
  };

  // Handle form submit
  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await put(`/api/admin/plans/${editPlan.id}`, {
          data: formData,
          token,
        });
        toast.show(t('plans.updated'), 'success');
      } else {
        await post('/api/admin/plans', {
          data: formData,
          token,
        });
        toast.show(t('plans.created'), 'success');
      }
      setModalOpen(false);
      fetchPlans(page);
    } catch (err) {
      toast.show(err.message || t('messages.operation_failed'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{t('plans.title')}</h1>
              <p className="text-blue-100 text-sm sm:text-base">{t('plans.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
            title={t('plans.add')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('plans.add')}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('plans.total_plans')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{statistics.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('plans.active_plans')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{statistics.active}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('plans.standard_plans')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{statistics.standard}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('plans.custom_plans')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">{statistics.custom}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            {/* Search */}
            <div className="flex-1 min-w-0 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t('plans.search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="theme-input w-full pl-10 pr-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="theme-input min-w-[180px] py-3 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white dark:bg-gray-800"
              >
                <option value="all">{t('plans.all_plans')}</option>
                <option value="standard">{t('plans.standard_plans')}</option>
                <option value="custom">{t('plans.custom_plans')}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {t('common.showing', { from: filteredPlans.length, to: plans.length, total: plans.length })}
          </div>
        </div>
      </div>

      {/* Enhanced Plans Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <PlansTable
          plans={filteredPlans}
          onEdit={handleEdit}
          onDelete={handleDelete}
          recentlyUpdated={recentlyUpdated}
          actionResult={actionResult}
          rowLoading={rowLoading}
        />
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Plan Form Modal */}
      <PlanFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editPlan}
        isEdit={isEdit}
      />
    </div>
  );
} 