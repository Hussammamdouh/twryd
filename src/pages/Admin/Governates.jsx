import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Modal from '../../UI/Common/Modal';

function GovernateFormModal({ open, onClose, onSubmit, initialData, isEdit }) {
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setForm({ name: initialData?.name || '' });
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Governorate name is required';
    }
    if (form.name.trim().length < 2) {
      newErrors.name = 'Governorate name must be at least 2 characters';
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
      toast.show(isEdit ? 'Governorate updated successfully!' : 'Governorate created successfully!', 'success');
      onClose();
    } catch (err) {
      toast.show(err.message || 'Failed to submit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Governorate' : 'Add New Governorate'} size="medium">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-theme-text mb-1">
            Governorate Name <span className="text-red-500">*</span>
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
            placeholder="Enter governorate name"
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

        <div className="flex gap-3 pt-2">
          <button 
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
          >
            Cancel
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
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Governorate')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AreaFormModal({ open, onClose, onSubmit, initialData, isEdit }) {
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setForm({ name: initialData?.name || '' });
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Area name is required';
    }
    if (form.name.trim().length < 2) {
      newErrors.name = 'Area name must be at least 2 characters';
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
      toast.show(isEdit ? 'Area updated successfully!' : 'Area created successfully!', 'success');
      onClose();
    } catch (err) {
      toast.show(err.message || 'Failed to submit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Area' : 'Add New Area'} size="medium">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="area-name" className="block text-sm font-semibold text-theme-text mb-1">
            Area Name <span className="text-red-500">*</span>
          </label>
          <input 
            id="area-name"
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
            placeholder="Enter area name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'area-name-error' : undefined}
          />
          {errors.name && (
            <div id="area-name-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {errors.name}
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
            Cancel
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
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Area')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Governates() {
  const { token } = useAuth();
  const [governates, setGovernates] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedGovernate, setSelectedGovernate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [govModalOpen, setGovModalOpen] = useState(false);
  const [govEditData, setGovEditData] = useState(null);
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [areaEditData, setAreaEditData] = useState(null);
  const [deleteGovId, setDeleteGovId] = useState(null);
  const [deleteAreaId, setDeleteAreaId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const toast = useToast();

  // Fetch governates and areas
  const fetchGovernates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get('/api/v1/location/governorates', { token, params: { per_page: 15 } });
      setGovernates(res.data?.data || []);
      // Auto-select first governate if none selected
      if (!selectedGovernate && res.data?.data?.length > 0) {
        setSelectedGovernate(res.data.data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load governates');
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async (govId) => {
    setLoading(true);
    setError('');
    try {
      if (govId) {
        const res = await get(`/api/v1/location/governorates/${govId}/areas`, { token, params: { per_page: 15 } });
        setAreas(res.data?.data || []);
      } else {
        setAreas([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load areas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchGovernates();
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (selectedGovernate) fetchAreas(selectedGovernate);
  }, [selectedGovernate]);

  // Governate CRUD
  const handleAddGovernate = async (form) => {
    await post('/admin/governorates', { token, data: form });
    await fetchGovernates();
  };
  const handleEditGovernate = async (form) => {
    await put(`/admin/governorates/${govEditData.id}`, { token, data: form });
    await fetchGovernates();
  };
  const handleDeleteGovernate = async (id) => {
    setDeleteLoading(true);
    try {
      await del(`/admin/governorates/${id}`, { token });
      toast.show('Governorate deleted!', 'success');
      setDeleteGovId(null);
      await fetchGovernates();
    } catch (err) {
      toast.show(err.message || 'Failed to delete', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Area CRUD
  const handleAddArea = async (form) => {
    await post(`/api/v1/location/governorates/${selectedGovernate}/areas`, { token, data: form });
    await fetchAreas(selectedGovernate);
  };
  const handleEditArea = async (form) => {
    await put(`/api/v1/location/governorates/${selectedGovernate}/areas/${areaEditData.id}`, { token, data: form });
    await fetchAreas(selectedGovernate);
  };
  const handleDeleteArea = async (id) => {
    setDeleteLoading(true);
    try {
      await del(`/api/v1/location/governorates/${selectedGovernate}/areas/${id}`, { token });
      toast.show('Area deleted!', 'success');
      setDeleteAreaId(null);
      await fetchAreas(selectedGovernate);
    } catch (err) {
      toast.show(err.message || 'Failed to delete', 'error');
    } finally {
      setDeleteLoading(false);
    }
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
            <span className="text-gray-900 dark:text-white">Governorates</span>
            <span className="text-gray-500 dark:text-gray-400 font-normal text-lg sm:text-xl ml-2">Management</span>
          </div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage governorates and their associated areas for delivery zones</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Governorates List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 lg:w-1/3">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Governorates</h2>
              <button
                className="px-3 py-1.5 rounded-lg font-medium shadow transition-all duration-200 bg-primary-600 hover:bg-primary-700 focus:bg-primary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 text-sm"
                onClick={() => { setGovEditData(null); setGovModalOpen(true); }}
              >
                + Add
              </button>
            </div>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col items-center py-8">
                <svg className="animate-spin h-6 w-6 text-primary-500 mb-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Loading...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm text-center py-4">{error}</div>
            ) : governates.length === 0 ? (
              <div className="text-center py-8">
                <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No governorates found</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {governates.map(g => (
                  <li
                    key={g.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedGovernate === g.id 
                        ? 'bg-primary-50 border-l-4 border-primary-600 dark:bg-primary-900/30 dark:border-primary-400' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedGovernate(g.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white truncate">{g.name}</span>
                      <div className="flex gap-1">
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                          onClick={e => { e.stopPropagation(); setGovEditData(g); setGovModalOpen(true); }}
                          title="Edit"
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                            <path d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.914l-9.193 9.193-3.06.34a.75.75 0 0 1-.83-.83l.34-3.06 9.193-9.193Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          onClick={e => { e.stopPropagation(); setDeleteGovId(g.id); }}
                          title="Delete"
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                            <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Areas Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 lg:w-2/3">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Areas for: <span className="text-primary-600 dark:text-primary-400">{governates.find(g => g.id === selectedGovernate)?.name || 'Select Governorate'}</span>
                </h2>
                {selectedGovernate && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {areas.length} {areas.length === 1 ? 'area' : 'areas'} in this governorate
                  </p>
                )}
              </div>
              <button
                className="px-3 py-1.5 rounded-lg font-medium shadow transition-all duration-200 bg-primary-600 hover:bg-primary-700 focus:bg-primary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 text-sm disabled:opacity-50"
                onClick={() => { setAreaEditData(null); setAreaModalOpen(true); }}
                disabled={!selectedGovernate}
              >
                + Add Area
              </button>
            </div>
          </div>
          <div className="p-4">
            {!selectedGovernate ? (
              <div className="text-center py-12">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Select a governorate to view its areas</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center py-8">
                <svg className="animate-spin h-6 w-6 text-primary-500 mb-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Loading areas...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm text-center py-4">{error}</div>
            ) : areas.length === 0 ? (
              <div className="text-center py-12">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No areas found for this governorate</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Add the first area to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Area Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {areas.map(a => (
                      <tr key={a.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{a.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              onClick={() => { setAreaEditData(a); setAreaModalOpen(true); }}
                              title="Edit"
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                                <path d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.914l-9.193 9.193-3.06.34a.75.75 0 0 1-.83-.83l.34-3.06 9.193-9.193Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                              onClick={() => setDeleteAreaId(a.id)}
                              title="Delete"
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                                <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <GovernateFormModal
        open={govModalOpen}
        onClose={() => setGovModalOpen(false)}
        onSubmit={govEditData ? handleEditGovernate : handleAddGovernate}
        initialData={govEditData}
        isEdit={!!govEditData}
      />
      <AreaFormModal
        open={areaModalOpen}
        onClose={() => setAreaModalOpen(false)}
        onSubmit={areaEditData ? handleEditArea : handleAddArea}
        initialData={areaEditData}
        isEdit={!!areaEditData}
      />
      
      {/* Confirm Delete Modals */}
      {deleteGovId && (
        <Modal open={!!deleteGovId} onClose={() => setDeleteGovId(null)} title="Delete Governorate" size="medium">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Governorate</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{governates.find(g => g.id === deleteGovId)?.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setDeleteGovId(null)}
                disabled={deleteLoading}
                className="flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteGovernate(deleteGovId)} 
                disabled={deleteLoading} 
                className="flex-1 py-2 px-4 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-red-600 hover:bg-red-700 focus:bg-red-800 text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteLoading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {deleteAreaId && (
        <Modal open={!!deleteAreaId} onClose={() => setDeleteAreaId(null)} title="Delete Area" size="medium">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Area</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this area? This action cannot be undone.
            </p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setDeleteAreaId(null)}
                disabled={deleteLoading}
                className="flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteArea(deleteAreaId)} 
                disabled={deleteLoading} 
                className="flex-1 py-2 px-4 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-red-600 hover:bg-red-700 focus:bg-red-800 text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteLoading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 