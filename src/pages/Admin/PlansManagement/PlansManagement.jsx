import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../UI/Common/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { get, post, put, del } from '../../../utils/api';
import PlansPageHeader from './PlansPageHeader';
import PlansStatsCards from './PlansStatsCards';
import PlansTable from './PlansTable';
import PlanFormModal from './PlanFormModal';

export default function PlansManagement() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  
  // State management
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, standard, custom
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('table');

  // Fetch plans data
  const fetchPlans = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await get('/api/admin/plans', { 
        token, 
        params: { page, per_page: 50 } 
      });
      // Defensive: always set plans as an array
      let plansData = response.data?.data || response.data?.plans?.data || response.data || [];
      if (!Array.isArray(plansData)) {
        // If the response is an object, try to extract an array or fallback to []
        plansData = Array.isArray(response.data?.plans) ? response.data.plans : [];
      }
      setPlans(plansData);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      toast.show(err.message || 'Failed to load plans', 'error');
      setPlans([]); // Defensive: always set to array on error
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) fetchPlans();
  }, [token, fetchPlans]);

  // Calculate statistics
  const stats = useMemo(() => [
    {
      id: 1,
      title: t('plans.stats.total'),
      value: plans.length,
      change: '+12%',
      changeType: 'positive',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBgGradient: 'from-blue-900/20 to-blue-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 2,
      title: t('plans.stats.active'),
      value: plans.filter(plan => plan.is_active).length,
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
      title: t('plans.stats.standard'),
      value: plans.filter(plan => !plan.is_custom).length,
      change: '+3%',
      changeType: 'positive',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      darkBgGradient: 'from-purple-900/20 to-purple-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      id: 4,
      title: t('plans.stats.custom'),
      value: plans.filter(plan => plan.is_custom).length,
      change: '+15%',
      changeType: 'positive',
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      darkBgGradient: 'from-orange-900/20 to-orange-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ], [plans, t]);

  // Filter plans based on search and filter
  const filteredData = useMemo(() => {
    return plans.filter(plan => {
      const matchesSearch = !searchTerm || 
        plan.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || 
        (selectedFilter === 'standard' && !plan.is_custom) ||
        (selectedFilter === 'custom' && plan.is_custom);
      
      return matchesSearch && matchesFilter;
    });
  }, [plans, searchTerm, selectedFilter]);

  // Handle add plan
  const handleAdd = async (formData) => {
    try {
      await post('/api/admin/plans', {
        data: formData,
        token,
      });
      toast.show(t('plans.created'), 'success');
      fetchPlans();
    } catch (err) {
      toast.show(err.message || t('messages.operation_failed'), 'error');
      throw err;
    }
  };

  // Handle edit plan
  const handleEdit = async (formData) => {
    try {
      await put(`/api/admin/plans/${editPlan.id}`, {
        data: formData,
        token,
      });
      toast.show(t('plans.updated'), 'success');
      fetchPlans();
    } catch (err) {
      toast.show(err.message || t('messages.operation_failed'), 'error');
      throw err;
    }
  };

  // Handle delete plan
  const handleDelete = async (planId) => {
    try {
      await del(`/api/admin/plans/${planId}`, { token });
      toast.show(t('plans.deleted'), 'success');
      fetchPlans();
    } catch (err) {
      toast.show(err.message || t('messages.operation_failed'), 'error');
    }
  };

  // Open edit modal
  const openEditModal = (plan) => {
    setEditPlan(plan);
    setIsEdit(true);
    setModalOpen(true);
  };

  // Open add modal
  const openAddModal = () => {
    setEditPlan(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  // Handle submit
  const handleSubmit = async (formData) => {
    if (isEdit) {
      await handleEdit(formData);
    } else {
      await handleAdd(formData);
    }
    setModalOpen(false);
    setEditPlan(null);
    setIsEdit(false);
  };

  // Handle sort
  const handleSort = useCallback((newSortBy) => {
    setSortOrder(sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortBy(newSortBy);
  }, [sortBy, sortOrder]);

  // Handle action
  const handleAction = useCallback((action, plan) => {
    switch (action) {
      case 'edit':
        openEditModal(plan);
        break;
      case 'delete':
        handleDelete(plan.id);
        break;
      default:
        console.log(`${action} for ${plan.name}`);
    }
  }, [openEditModal, handleDelete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <PlansPageHeader onAddPlan={openAddModal} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Stats Cards Section */}
        <div className="mb-10 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {t('nav.plans')} Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg max-w-2xl">
                {t('plans.description')}
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
          <PlansStatsCards stats={stats} />
        </div>
        
        {/* Plans Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="space-y-2">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {t('nav.plans')} Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  {t('plans.description')}
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('plans.showing', { from: filteredData.length, to: filteredData.length, total: plans.length })}</span>
                </div>
                <button 
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('plans.add')}
                </button>
              </div>
            </div>
            
            <PlansTable
              data={filteredData}
              totalData={plans}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
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
