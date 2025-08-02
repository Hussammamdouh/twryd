import React, { useState, useEffect, useMemo } from 'react';
import { get, post, put, del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Modal from '../../UI/Common/Modal';
import ConfirmModal from '../../UI/supplier/ConfirmModal';

function AreaFormModal({ open, onClose, onSubmit, initialData, isEdit, governates }) {
  const [form, setForm] = useState({ 
    name: '', 
    governorate_id: '',
    polygon: [
      { lat: 30.0444, lng: 31.2357 },
      { lat: 30.0544, lng: 31.2457 },
      { lat: 30.0644, lng: 31.2557 },
      { lat: 30.0444, lng: 31.2357 }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || '',
        governorate_id: initialData?.governorate_id || '',
        polygon: initialData?.polygon || [
          { lat: 30.0444, lng: 31.2357 },
          { lat: 30.0544, lng: 31.2457 },
          { lat: 30.0644, lng: 31.2557 },
          { lat: 30.0444, lng: 31.2357 }
        ]
      });
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing - only if there's an error
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = t('areas.name') + ' ' + t('form.required').toLowerCase();
    }
    if (!form.governorate_id) {
      newErrors.governorate_id = t('areas.select_governorate');
    }
    if (!form.polygon || form.polygon.length < 3) {
      newErrors.polygon = t('areas.polygon_points') + ' ' + t('form.required').toLowerCase();
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSubmit(form);
      toast.show(isEdit ? t('areas.updated') : t('areas.created'), 'success');
      onClose();
    } catch (err) {
      toast.show(err.message || 'Failed to submit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? t('modal.edit_area') : t('modal.add_area')} size="large">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-theme-text mb-1">
              {t('areas.name')} <span className="text-red-500">*</span>
            </label>
            <input 
              id="name"
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              maxLength={50}
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
                errors.name 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/30 focus:ring-red-400 focus:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
              placeholder={t('form.placeholder.area_name')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <div id="name-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {errors.name}
              </div>
            )}
          </div>
        
          <div>
            <label htmlFor="governorate_id" className="block text-sm font-semibold text-theme-text mb-1">
              {t('areas.governorate')} <span className="text-red-500">*</span>
            </label>
            <select
              id="governorate_id"
              name="governorate_id"
              value={form.governorate_id}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
                errors.governorate_id 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/30 focus:ring-red-400 focus:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
              aria-invalid={!!errors.governorate_id}
              aria-describedby={errors.governorate_id ? 'governorate-error' : undefined}
            >
              <option value="">{t('areas.select_governorate')}</option>
              {governates.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {errors.governorate_id && (
              <div id="governorate-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {errors.governorate_id}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-theme-text mb-1">
              {t('areas.polygon_points')} <span className="text-red-500">*</span>
            </label>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Default coordinates are provided. For production, implement a map interface to set coordinates.
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">Current polygon points:</div>
              {form.polygon.map((point, index) => (
                <div key={index} className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                  Point {index + 1}: {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                </div>
              ))}
            </div>
            {errors.polygon && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {errors.polygon}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
            >
              {t('form.cancel')}
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 py-2 px-4 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700 focus:bg-primary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? (isEdit ? t('form.save') + '...' : t('form.create') + '...') : (isEdit ? t('form.save') + ' ' + t('common.changes') : t('form.create') + ' ' + t('nav.areas').slice(0, -1))}
            </button>
          </div>
        </form>
    </Modal>
  );
}

export default function Areas() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const [areas, setAreas] = useState([]);
  const [governates, setGovernates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedGovernate, setSelectedGovernate] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({ add: false, edit: false, delete: false });

  // Fetch governates and areas
  const fetchAll = async (governorateId) => {
    setLoading(true);
    setError('');
    try {
      // Fetch governates first
      const govRes = await get('/api/v1/location/governorates', { token });
      const governatesList = govRes.data?.data || [];
      setGovernates(governatesList);
      
      // Set selectedGovernate based on the provided governorateId
      if (governorateId !== undefined) {
        setSelectedGovernate(governorateId);
      }
      
      // Fetch areas based on the governorateId
      let areasRes = { data: { data: [] } };
      if (governorateId && governorateId !== '') {
        // Fetch areas for specific governorate
        areasRes = await get(`/api/v1/location/governorates/${governorateId}/areas`, { token, params: { per_page: 50 } });
      }
      // If "All Governorates" is selected, keep areas empty (user needs to select a governorate)
      setAreas(areasRes.data?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load areas/governates');
      toast.show(err.message || 'Failed to load areas/governates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAll(''); // Start with "All Governorates" selected
  }, [token]);

  // Add handler for governate selection
  const handleGovernateChange = (e) => {
    const govId = e.target.value;
    setSelectedGovernate(govId);
    fetchAll(govId);
  };

  // Add area
  const handleAdd = async (form) => {
    setActionLoading(prev => ({ ...prev, add: true }));
    try {
      await post('/api/v1/location/admin/areas', { token, data: form });
      await fetchAll(selectedGovernate);
    } finally {
      setActionLoading(prev => ({ ...prev, add: false }));
    }
  };

  // Edit area
  const handleEdit = async (form) => {
    setActionLoading(prev => ({ ...prev, edit: true }));
    try {
      await put(`/api/v1/location/admin/areas/${editData.id}`, { token, data: form });
      await fetchAll(selectedGovernate);
    } finally {
      setActionLoading(prev => ({ ...prev, edit: false }));
    }
  };

  // Delete area
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await del(`/api/v1/location/admin/areas/${deleteTarget.id}`, { token });
      toast.show(t('areas.deleted'), 'success');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await fetchAll(selectedGovernate);
    } catch (err) {
      toast.show(err.message || t('messages.failed_to_delete'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Search
  const filteredAreas = useMemo(() => {
    return areas.filter((a) => {
      const governorateName = governates.find(g => g.id === a.governorate_id)?.name || '';
      const matchesSearch = !search || 
        (a.name && a.name.toLowerCase().includes(search.toLowerCase())) || 
        (governorateName && governorateName.toLowerCase().includes(search.toLowerCase()));
      return matchesSearch;
    });
  }, [areas, search, governates]);

  const handleSearch = (value) => {
    setSearch(value);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-2 md:px-0">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <span className="text-gray-900 dark:text-white">{t('areas.title')}</span>
            <span className="text-gray-500 dark:text-gray-400 font-normal text-lg sm:text-xl ml-2">{t('common.management')}</span>
          </div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('areas.subtitle')}</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full sm:w-auto">
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
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                aria-label={t('areas.search_placeholder')}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
            value={selectedGovernate}
            onChange={handleGovernateChange}
            aria-label="Filter by governorate"
          >
            <option value="">{t('areas.all_governorates')}</option>
            {governates.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <button
            className="px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700 focus:bg-primary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-60 flex items-center gap-2"
            onClick={() => { setEditData(null); setModalOpen(true); }}
            disabled={actionLoading.add}
          >
            {actionLoading.add ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {t('areas.adding')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('areas.add')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Areas Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('areas.table_name')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('areas.table_governorate')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('areas.table_polygon_points')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('areas.table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span className="text-gray-500 dark:text-gray-400 font-medium">{t('areas.loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-red-500 font-medium">{error}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          {selectedGovernate === '' ? t('areas.select_governorate') : t('areas.no_areas')}
                        </span>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                          {selectedGovernate === '' 
                            ? t('areas.choose_governorate') 
                            : t('messages.try_adjusting_filters')
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAreas.map((area) => (
                  <tr key={area.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {area.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {governates.find(g => g.id === area.governorate_id)?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                        {area.polygon?.length || 0} points
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditData(area); setModalOpen(true); }}
                          disabled={actionLoading.edit}
                          className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          title={t('areas.edit')}
                          aria-label={t('areas.edit')}
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.914l-9.193 9.193-3.06.34a.75.75 0 0 1-.83-.83l.34-3.06 9.193-9.193Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => { setDeleteTarget(area); setDeleteModalOpen(true); }}
                          disabled={actionLoading.delete}
                          className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                          title={t('areas.delete')}
                          aria-label={t('areas.delete')}
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
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

      {/* Modals */}
      <AreaFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editData ? handleEdit : handleAdd}
        initialData={editData}
        isEdit={!!editData}
        governates={governates}
      />
      
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Area"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        loading={deleteLoading}
      />
    </div>
  );
} 