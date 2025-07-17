import React, { useEffect, useState, useMemo } from 'react';
import { get, post, put, del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Modal from '../../UI/Common/Modal';

function AreaFormModal({ open, onClose, onSubmit, initialData, isEdit, governates }) {
  const [form, setForm] = useState({ name: '', governorate_id: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || '',
        governorate_id: initialData?.governorate_id || '',
      });
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
          <label className="block text-sm font-medium mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Governate</label>
          <select
            name="governorate_id"
            value={form.governorate_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Governate</option>
            {governates.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 font-bold text-white rounded bg-blue-500 hover:bg-blue-600 transition disabled:opacity-60 mt-2">
          {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Area')}
        </button>
      </form>
    </Modal>
  );
}

function ConfirmDeleteModal({ open, onClose, onConfirm, name, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Area">
      <h3 className="text-xl font-bold mb-6">Delete Area</h3>
      <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{name}</span>?</p>
      <div className="flex gap-4 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
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
  // Add state for selected governate
  const [selectedGovernate, setSelectedGovernate] = useState('');
  const toast = useToast();

  // Fetch governates and areas
  const fetchAll = async (governorateId) => {
    setLoading(true);
    setError('');
    try {
      // Fetch governates first
      const govRes = await get('/admin/governorates', { token });
      const governatesList = govRes.data?.data || [];
      setGovernates(governatesList);
      // Determine which governate to fetch areas for
      const govId = governorateId || governatesList[0]?.id || '';
      setSelectedGovernate(govId);
      // Fetch areas for the selected governate
      let areasRes = { data: { data: [] } };
      if (govId) {
        areasRes = await get(`/api/v1/location/governorates/${govId}/areas`, { token, params: { per_page: 15 } });
      }
      setAreas(areasRes.data?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load areas/governates');
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to fetch for the first governate
  useEffect(() => {
    if (token) fetchAll();
    // eslint-disable-next-line
  }, [token]);

  // Add handler for governate selection
  const handleGovernateChange = (e) => {
    const govId = e.target.value;
    setSelectedGovernate(govId);
    fetchAll(govId);
  };

  // Add area
  const handleAdd = async (form) => {
    await post('/admin/areas', { token, data: form });
    await fetchAll();
  };

  // Edit area
  const handleEdit = async (form) => {
    await put(`/admin/areas/${editData.id}`, { token, data: form });
    await fetchAll();
  };

  // Delete area
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await del(`/admin/areas/${deleteTarget.id}`, { token });
      toast.show('Area deleted!', 'success');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await fetchAll();
    } catch (err) {
      toast.show(err.message || 'Failed to delete', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Search
  const filteredAreas = useMemo(() => {
    return areas.filter((a) => {
      const matchesSearch = !search || (a.name && a.name.toLowerCase().includes(search.toLowerCase())) || (a.governorate?.name && a.governorate.name.toLowerCase().includes(search.toLowerCase()));
      return matchesSearch;
    });
  }, [areas, search]);

  return (
    <div className="flex justify-center items-start min-h-[80vh] w-full py-8 px-2">
      <div className="w-full max-w-4xl flex flex-col gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-8 text-blue-700 flex items-center gap-2">Areas Management</h1>
        <div className="flex flex-col sm:flex-row gap-2 mb-2 sm:mb-4">
          <select
            className="px-2 sm:px-3 py-2 border rounded text-xs sm:text-sm"
            value={selectedGovernate}
            onChange={handleGovernateChange}
          >
            {governates.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <input
            className="px-2 sm:px-3 py-2 border rounded w-full text-xs sm:text-sm"
            placeholder="Search areas or governate..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="px-2 sm:px-4 py-2 bg-blue-600 text-white rounded font-bold text-xs sm:text-base"
            onClick={() => { setEditData(null); setModalOpen(true); }}
          >
            + Add Area
          </button>
        </div>
        <div className="bg-white rounded shadow p-2 sm:p-4 overflow-x-auto">
          {loading ? (
            <div className="text-gray-500 text-center py-8 sm:py-12">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-8 sm:py-12">{error}</div>
          ) : filteredAreas.length === 0 ? (
            <div className="text-gray-400 text-center py-8 sm:py-12">No areas found.</div>
          ) : (
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold">Governate</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAreas.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{a.name}</td>
                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{a.governorate?.name || ''}</td>
                    <td className="px-2 sm:px-4 py-2 flex gap-1 sm:gap-2">
                      <button
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-bold"
                        onClick={() => { setEditData(a); setModalOpen(true); }}
                      >Edit</button>
                      <button
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold"
                        onClick={() => { setDeleteTarget(a); setDeleteModalOpen(true); }}
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <AreaFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editData ? handleEdit : handleAdd}
        initialData={editData}
        isEdit={!!editData}
        governates={governates}
      />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        name={deleteTarget?.name}
        loading={deleteLoading}
      />
    </div>
  );
} 