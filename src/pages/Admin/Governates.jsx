import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Modal from '../../UI/Common/Modal';

function GovernateFormModal({ open, onClose, onSubmit, initialData, isEdit }) {
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setForm({ name: initialData?.name || '' });
    }
  }, [open, initialData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      toast.show(isEdit ? 'Governate updated!' : 'Governate created!', 'success');
      onClose();
    } catch (err) {
      toast.show(err.message || 'Failed to submit', 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Governate' : 'Add New Governate'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-theme-text">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="theme-input w-full px-3 py-2 rounded" />
        </div>
        <button type="submit" disabled={loading} className="theme-button w-full py-2 font-bold rounded transition disabled:opacity-60 mt-2">
          {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Governate')}
        </button>
      </form>
    </Modal>
  );
}

function AreaFormModal({ open, onClose, onSubmit, initialData, isEdit }) {
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setForm({ name: initialData?.name || '' });
    }
  }, [open, initialData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      toast.show(isEdit ? 'Area updated!' : 'Area created!', 'success');
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
          <label className="block text-sm font-medium mb-1 text-theme-text">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="theme-input w-full px-3 py-2 rounded" />
        </div>
        <button type="submit" disabled={loading} className="theme-button w-full py-2 font-bold rounded transition disabled:opacity-60 mt-2">
          {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Area')}
        </button>
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
      toast.show('Governate deleted!', 'success');
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
    <div className="flex justify-center items-start min-h-[80vh] w-full py-8 px-2">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4">
        {/* Governates List */}
        <div className="theme-card w-full md:w-1/3 p-2 sm:p-4 mb-2 md:mb-0">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="text-base sm:text-lg font-bold text-primary-700">Governates</div>
            <button
              className="theme-button px-2 sm:px-3 py-1 font-bold shadow text-xs sm:text-sm"
              onClick={() => { setGovEditData(null); setGovModalOpen(true); }}
            >
              + Add
            </button>
          </div>
          <ul className="divide-y divide-theme-border">
            {governates.map(g => (
              <li
                key={g.id}
                className={`py-1 sm:py-2 px-1 sm:px-2 rounded-lg cursor-pointer flex items-center justify-between transition text-xs sm:text-base ${
                  selectedGovernate === g.id 
                    ? 'bg-primary-50 border-l-4 border-primary-600 dark:bg-primary-900/30 dark:border-primary-400' 
                    : 'hover:bg-theme-surface'
                }`}
                onClick={() => setSelectedGovernate(g.id)}
              >
                <span className="font-medium text-theme-text truncate max-w-[90px] sm:max-w-[180px]">{g.name}</span>
                <div className="flex gap-1">
                  <button
                    className="p-1 text-primary-600 hover:bg-primary-100 rounded"
                    onClick={e => { e.stopPropagation(); setGovEditData(g); setGovModalOpen(true); }}
                    title="Edit"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.914l-9.193 9.193-3.06.34a.75.75 0 0 1-.83-.83l.34-3.06 9.193-9.193Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    onClick={e => { e.stopPropagation(); setDeleteGovId(g.id); }}
                    title="Delete"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* Areas Table */}
        <div className="theme-card w-full md:w-2/3 p-2 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-4 flex-wrap gap-1 sm:gap-2">
            <div className="text-base sm:text-lg font-bold text-primary-700 truncate">Areas for: <span className="text-theme-text">{governates.find(g => g.id === selectedGovernate)?.name || '...'}</span></div>
            <button
              className="theme-button px-2 sm:px-3 py-1 font-bold shadow text-xs sm:text-sm"
              onClick={() => { setAreaEditData(null); setAreaModalOpen(true); }}
              disabled={!selectedGovernate}
            >
              + Add
            </button>
          </div>
          <div className="theme-table overflow-x-auto rounded-lg">
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="theme-table-header text-primary-700 font-semibold">
                  <th className="px-2 sm:px-4 py-2 text-left">Name</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} className="text-center py-8 sm:py-12 text-theme-text-secondary">Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan={2} className="text-center py-8 sm:py-12 text-red-500">{error}</td></tr>
                ) : areas.length === 0 ? (
                  <tr><td colSpan={2} className="text-center py-8 sm:py-12 text-theme-text-muted">No areas found.</td></tr>
                ) : (
                  areas.map(a => (
                    <tr key={a.id} className="border-b border-theme-border last:border-b-0 hover:bg-theme-surface transition">
                      <td className="px-2 sm:px-4 py-2 font-medium text-theme-text truncate max-w-[90px] sm:max-w-[220px]">{a.name}</td>
                      <td className="px-2 sm:px-4 py-2 flex gap-1 sm:gap-2 flex-wrap">
                        <button
                          className="p-1 sm:p-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-full transition shadow"
                          onClick={() => { setAreaEditData(a); setAreaModalOpen(true); }}
                          title="Edit"
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.914l-9.193 9.193-3.06.34a.75.75 0 0 1-.83-.83l.34-3.06 9.193-9.193Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button
                          className="p-1 sm:p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition shadow"
                          onClick={() => setDeleteAreaId(a.id)}
                          title="Delete"
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
        <Modal open={!!deleteGovId} onClose={() => setDeleteGovId(null)} title="Delete Governate">
          <h3 className="text-xl font-bold mb-6 text-theme-text">Delete Governate</h3>
          <p className="mb-6 text-theme-text">Are you sure you want to delete <span className="font-semibold">{governates.find(g => g.id === deleteGovId)?.name}</span>?</p>
          <div className="flex gap-4 justify-end">
            <button onClick={() => setDeleteGovId(null)} className="theme-button-secondary px-4 py-2 rounded">Cancel</button>
            <button onClick={() => handleDeleteGovernate(deleteGovId)} disabled={deleteLoading} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
      {deleteAreaId && (
        <Modal open={!!deleteAreaId} onClose={() => setDeleteAreaId(null)} title="Delete Area">
          <h3 className="text-xl font-bold mb-6 text-theme-text">Delete Area</h3>
          <p className="mb-6 text-theme-text">Are you sure you want to delete this area?</p>
          <div className="flex gap-4 justify-end">
            <button onClick={() => setDeleteAreaId(null)} className="theme-button-secondary px-4 py-2 rounded">Cancel</button>
            <button onClick={() => handleDeleteArea(deleteAreaId)} disabled={deleteLoading} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
} 