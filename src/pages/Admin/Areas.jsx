import React, { useEffect, useState, useMemo } from 'react';
import { get, post, put, del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
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
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Area name is required';
    }
    if (!form.governorate_id) {
      newErrors.governorate_id = 'Please select a governorate';
    }
    if (!form.polygon || form.polygon.length < 3) {
      newErrors.polygon = 'At least 3 polygon points are required';
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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Area' : 'Add New Area'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
          <label className="block text-sm font-medium mb-1 text-theme-text">
            Area Name <span className="text-red-500">*</span>
          </label>
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            className={`theme-input w-full px-3 py-2 rounded-lg transition ${
              errors.name ? 'border-red-300' : ''
            }`}
            placeholder="Enter area name"
            aria-label="Area name"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
          </div>
        
          <div>
          <label className="block text-sm font-medium mb-1 text-theme-text">
            Governorate <span className="text-red-500">*</span>
          </label>
            <select
              name="governorate_id"
              value={form.governorate_id}
              onChange={handleChange}
              required
            className={`theme-input w-full px-3 py-2 rounded-lg transition ${
              errors.governorate_id ? 'border-red-300' : ''
            }`}
            aria-label="Select governorate"
            >
            <option value="">Select Governorate</option>
              {governates.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          {errors.governorate_id && (
            <p className="text-red-500 text-xs mt-1">{errors.governorate_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-theme-text">
            Polygon Coordinates <span className="text-red-500">*</span>
          </label>
          <div className="text-xs text-theme-text-secondary mb-2">
            Default coordinates are provided. For production, implement a map interface to set coordinates.
          </div>
          <div className="bg-theme-surface p-3 rounded-lg border border-theme-border">
            <div className="text-xs text-theme-text-secondary mb-2">Current polygon points:</div>
            {form.polygon.map((point, index) => (
              <div key={index} className="text-xs text-theme-text mb-1">
                Point {index + 1}: {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
              </div>
            ))}
          </div>
          {errors.polygon && (
            <p className="text-red-500 text-xs mt-1">{errors.polygon}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            type="button"
            onClick={onClose}
            className="theme-button-secondary flex-1 px-4 py-2 rounded-lg transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="theme-button flex-1 px-4 py-2 rounded-lg transition disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {isEdit ? 'Saving...' : 'Creating...'}
      </div>
            ) : (
              isEdit ? 'Save Changes' : 'Create Area'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Areas() {
  const { token } = useAuth();
  const [areas, setAreas] = useState([]);
  const [governates, setGovernates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedGovernate, setSelectedGovernate] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const toast = useToast();

  // Fetch governates and areas
  const fetchAll = async (governorateId) => {
    setLoading(true);
    setError('');
    try {
      // Fetch governates first
      const govRes = await get('/api/v1/location/governorates', { token });
      const governatesList = govRes.data?.data || [];
      setGovernates(governatesList);
      
      // Determine which governate to fetch areas for
      const govId = governorateId || governatesList[0]?.id || '';
      setSelectedGovernate(govId);
      
      // Fetch areas for the selected governate using the new admin endpoint
      let areasRes = { data: { data: [] } };
      if (govId) {
        areasRes = await get(`/api/v1/location/governorates/${govId}/areas`, { token, params: { per_page: 50 } });
      }
      setAreas(areasRes.data?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load areas/governates');
      toast.show(err.message || 'Failed to load areas/governates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAll();
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
      toast.show('Area deleted successfully!', 'success');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await fetchAll(selectedGovernate);
    } catch (err) {
      toast.show(err.message || 'Failed to delete area', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Search
  const filteredAreas = useMemo(() => {
    return areas.filter((a) => {
      const matchesSearch = !search || 
        (a.name && a.name.toLowerCase().includes(search.toLowerCase())) || 
        (a.governorate?.name && a.governorate.name.toLowerCase().includes(search.toLowerCase()));
      return matchesSearch;
    });
  }, [areas, search]);

  const handleSearch = (value) => {
    setSearch(value);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-2 md:px-0">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-8 text-primary-700 flex items-center gap-2 drop-shadow-sm">
        <span className="inline-block bg-primary-100 text-primary-600 rounded-full px-2 sm:px-3 py-1 text-base sm:text-lg shadow">Areas</span>
        <span className="text-theme-text-secondary font-normal text-base sm:text-lg">Management</span>
      </h1>

      {/* Search and Filter Controls */}
      <div className="theme-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted pointer-events-none">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
                </svg>
              </span>
        <input
                type="text"
                placeholder="Search areas by name or governorate..."
                className="theme-input pl-10 pr-4 py-2 w-full rounded-lg"
          value={search}
                onChange={(e) => handleSearch(e.target.value)}
                aria-label="Search areas"
              />
            </div>
          </div>
          <select
            className="theme-input px-4 py-2 rounded-lg"
            value={selectedGovernate}
            onChange={handleGovernateChange}
            aria-label="Filter by governorate"
          >
            <option value="">All Governorates</option>
            {governates.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        <button
            className="theme-button px-4 py-2 rounded-lg font-semibold shadow transition"
          onClick={() => { setEditData(null); setModalOpen(true); }}
            disabled={actionLoading.add}
          >
            {actionLoading.add ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Adding...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Area
              </div>
            )}
        </button>
        </div>
      </div>

      {/* Areas Table */}
      <div className="theme-card p-3 sm:p-6 md:p-10">
        <div className="theme-table overflow-x-auto rounded-lg shadow-sm">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="theme-table-header text-primary-700 text-xs sm:text-base font-semibold">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Name</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Governorate</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Polygon Points</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 sm:py-12 text-theme-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-6 w-6 text-primary-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span>Loading areas...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 sm:py-12 text-red-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 sm:py-12 text-theme-text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <span>No areas found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAreas.map((area, idx) => (
                  <tr key={area.id} className={`border-b border-theme-border last:border-b-0 ${idx % 2 === 0 ? 'bg-theme-surface' : 'bg-theme-card'} hover:bg-theme-surface transition group`}>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-theme-text text-xs sm:text-base">
                      {area.name}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-theme-text-secondary">
                      {area.governorate?.name || 'N/A'}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-theme-text-secondary">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                        {area.polygon?.length || 0} points
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 flex gap-1 sm:gap-2 flex-wrap">
                      <button
                        onClick={() => { setEditData(area); setModalOpen(true); }}
                        disabled={actionLoading.edit}
                        className="flex items-center gap-1 p-1 sm:p-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-full transition shadow text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-60"
                        title="Edit area"
                        aria-label="Edit area"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.914l-9.193 9.193-3.06.34a.75.75 0 0 1-.83-.83l.34-3.06 9.193-9.193Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="hidden md:inline text-xs font-semibold">Edit</span>
                      </button>
                      <button
                        onClick={() => { setDeleteTarget(area); setDeleteModalOpen(true); }}
                        disabled={actionLoading.delete}
                        className="flex items-center gap-1 p-1 sm:p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition shadow text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-60"
                        title="Delete area"
                        aria-label="Delete area"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="hidden md:inline text-xs font-semibold">Delete</span>
                      </button>
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