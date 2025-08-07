import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../UI/Common/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { get, post, put, del } from '../../../utils/api';
import AreasPageHeader from './AreasPageHeader';
import AreasStatsCards from './AreasStatsCards';
import AreasTable from './AreasTable';
import AreaFormModal from './AreaFormModal';

export default function AreasManagement() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  
  // State management
  const [areas, setAreas] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editArea, setEditArea] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('table');

  // Fetch areas and governorates data
  const fetchData = useCallback(async (governorateId = '') => {
    setLoading(true);
    try {
      // Fetch governorates first
      const govRes = await get('/api/v1/location/governorates', { token });
      let governoratesList = govRes.data?.data || govRes.data?.governorates || [];
      if (!Array.isArray(governoratesList)) governoratesList = [];
      setGovernorates(governoratesList);
      
      // Set selectedGovernorate if provided
      if (governorateId !== undefined) {
        setSelectedGovernorate(governorateId);
      }
      
      // Fetch areas based on the governorateId
      let areasList = [];
      if (governorateId && governorateId !== '') {
        const areasRes = await get(`/api/v1/location/governorates/${governorateId}/areas`, { 
          token, 
          params: { per_page: 50 } 
        });
        areasList = areasRes.data?.data || areasRes.data?.areas || [];
      }
      // If "All Governorates" is selected, keep areas empty (user needs to select a governorate)
      if (!Array.isArray(areasList)) areasList = [];
      setAreas(areasList);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.show(err.message || 'Failed to load areas/governorates', 'error');
      setGovernorates([]);
      setAreas([]);
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) fetchData(''); // Start with "All Governorates" selected
  }, [token, fetchData]);

  // Handle governorate selection - this should trigger API call
  const handleGovernorateChange = (governorateId) => {
    setSelectedGovernorate(governorateId);
    fetchData(governorateId); // This will fetch areas for the selected governorate
  };

  // Calculate stats
  const stats = useMemo(() => [
    {
      id: 1,
      title: t('areas.stats.total'),
      value: areas.length,
      change: '+12%',
      changeType: 'positive',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBgGradient: 'from-blue-900/20 to-blue-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: t('areas.stats.governorates'),
      value: governorates.length,
      change: '+5%',
      changeType: 'positive',
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      darkBgGradient: 'from-emerald-900/20 to-emerald-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H3.055zM11 4a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V4zM4.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      )
    },
    {
      id: 3,
      title: t('areas.stats.active'),
      value: areas.filter(area => area.is_active).length,
      change: '+8%',
      changeType: 'positive',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      darkBgGradient: 'from-purple-900/20 to-purple-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 4,
      title: t('areas.stats.inactive'),
      value: areas.filter(area => !area.is_active).length,
      change: '-3%',
      changeType: 'negative',
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      darkBgGradient: 'from-orange-900/20 to-orange-800/20',
      icon: (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ], [areas, governorates, t]);

  // Filter areas based on search only (governorate filtering is done via API)
  const filteredData = useMemo(() => {
    return areas.filter(area => {
      const governorateName = governorates.find(g => g.id === area.governorate_id)?.name || '';
      const matchesSearch = !searchTerm || 
        (area.name && area.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (governorateName && governorateName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [areas, searchTerm, governorates]);

  // Handle add area
  const handleAdd = async (formData) => {
    try {
      await post('/api/v1/location/areas', {
        data: formData,
        token,
      });
      toast.show(t('areas.created'), 'success');
      fetchData(selectedGovernorate);
    } catch (err) {
      toast.show(err.message || t('messages.operation_failed'), 'error');
      throw err;
    }
  };

  // Handle edit area
  const handleEdit = async (formData) => {
    try {
      await put(`/api/v1/location/areas/${editArea.id}`, {
        data: formData,
        token,
      });
      toast.show(t('areas.updated'), 'success');
      fetchData(selectedGovernorate);
    } catch (err) {
      toast.show(err.message || t('messages.operation_failed'), 'error');
      throw err;
    }
  };

  // Handle delete area
  const handleDelete = async (areaId) => {
    try {
      await del(`/api/v1/location/areas/${areaId}`, { token });
      toast.show(t('areas.deleted'), 'success');
      fetchData(selectedGovernorate);
    } catch (err) {
      toast.show(err.message || t('messages.operation_failed'), 'error');
    }
  };

  // Open edit modal
  const openEditModal = (area) => {
    setEditArea(area);
    setIsEdit(true);
    setModalOpen(true);
  };

  // Open add modal
  const openAddModal = () => {
    setEditArea(null);
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
    setEditArea(null);
    setIsEdit(false);
  };

  // Handle sort
  const handleSort = useCallback((newSortBy) => {
    setSortOrder(sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortBy(newSortBy);
  }, [sortBy, sortOrder]);

  // Handle action
  const handleAction = useCallback((action, area) => {
    switch (action) {
      case 'edit':
        openEditModal(area);
        break;
      case 'delete':
        handleDelete(area.id);
        break;
      default:
        console.log(`${action} for ${area.name}`);
    }
  }, [openEditModal, handleDelete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <AreasPageHeader onAddArea={openAddModal} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Stats Cards Section */}
        <div className="mb-10 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {t('nav.areas')} Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg max-w-2xl">
                {t('areas.description')}
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
      <AreasStatsCards stats={stats} />
        </div>
        
        {/* Areas Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="space-y-2">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {t('nav.areas')} Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  {t('areas.description')}
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('areas.showing', { from: filteredData.length, to: filteredData.length, total: areas.length })}</span>
                </div>
                <button 
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('areas.add')}
                </button>
              </div>
            </div>
            
            {/* Governorate Filter - Always visible */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder={t('areas.search_placeholder')}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label={t('areas.search_placeholder')}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 min-w-[200px]">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('areas.governorate')}
                  </label>
                  <select
                    value={selectedGovernorate}
                    onChange={(e) => handleGovernorateChange(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
                  >
                    <option value="">{t('areas.all_governorates')}</option>
                    {governorates?.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
      <AreasTable
              data={filteredData}
              totalData={areas}
        loading={loading}
        searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
        selectedGovernorate={selectedGovernorate}
              setSelectedGovernorate={handleGovernorateChange}
              governorates={governorates}
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

      <AreaFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editArea}
        isEdit={isEdit}
        governorates={governorates}
      />
    </div>
  );
}
