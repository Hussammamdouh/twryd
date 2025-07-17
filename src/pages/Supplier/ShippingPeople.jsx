import React, { useState, useEffect } from 'react';
import { FiSearch, FiUserPlus, FiEdit2, FiTrash2, FiPause, FiPlay } from 'react-icons/fi';
import { get, post, put, del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../UI/Common/Modal';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 border-green-300',
  inactive: 'bg-gray-100 text-gray-500 border-gray-300',
  suspended: 'bg-red-100 text-red-700 border-red-300',
};

function DriverFormModal({ open, onClose, onSubmit, initialData, loading }) {
  const [form, setForm] = useState(
    initialData || { name: '', type: '', phone: '', car_name: '', car_number: '', license_number: '', warehouse: '', status: 'active', license_file: null }
  );

  useEffect(() => {
    if (open) setForm(initialData || { name: '', type: '', phone: '', car_name: '', car_number: '', license_number: '', warehouse: '', status: 'active', license_file: null });
  }, [open, initialData]);

  const handleChange = e => {
    const { name, value, type: inputType, files } = e.target;
    setForm(f => ({ ...f, [name]: inputType === 'file' ? files[0] : value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit Delivery Person' : 'Add New Delivery Person'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        <input name="type" value={form.type} onChange={handleChange} required placeholder="Type (e.g. driver)" className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone Number" className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        <input name="car_name" value={form.car_name} onChange={handleChange} required placeholder="Car Name" className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        <input name="car_number" value={form.car_number} onChange={handleChange} required placeholder="Car Number" className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        <input name="license_number" value={form.license_number} onChange={handleChange} required placeholder="License Number" className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        <input name="warehouse" value={form.warehouse} onChange={handleChange} placeholder="Assigned Warehouse (optional)" className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        <input name="license_file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="w-full" />
        <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <button type="submit" disabled={loading} className="w-full py-2 font-bold text-white rounded bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-60 mt-2 shadow">
          {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Delivery Person')}
        </button>
      </form>
    </Modal>
  );
}

function ConfirmDeleteModal({ open, onClose, onConfirm, driverName, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Delivery Person">
      <h3 className="text-xl font-bold mb-6 text-red-700 flex items-center gap-2">Delete Delivery Person</h3>
      <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{driverName}</span>?</p>
      <div className="flex gap-4 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 shadow">
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

export default function ShippingPeople() {
  const { token, user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Fetch drivers
  const fetchDrivers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get('/api/supplier/shipping-drivers', { token });
      // Accept both {data: [...]} and {data: {shipping_drivers: [...]}}
      let driversArr = [];
      if (Array.isArray(res.data)) {
        driversArr = res.data;
      } else if (res.data?.shipping_drivers) {
        driversArr = res.data.shipping_drivers;
      }
      setDrivers(driversArr);
    } catch (err) {
      setError(err.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDrivers();
    // eslint-disable-next-line
  }, [token]);

  // Pagination logic (client-side for now)
  const perPage = 4;
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.phone?.includes(search);
    const matchesWarehouse = !warehouseFilter || d.warehouse === warehouseFilter;
    const matchesStatus = !statusFilter || d.status === statusFilter;
    return matchesSearch && matchesWarehouse && matchesStatus;
  });
  const totalPages = Math.ceil(filteredDrivers.length / perPage);
  const pagedDrivers = filteredDrivers.slice((page - 1) * perPage, page * perPage);

  const handleAdd = () => { setEditData(null); setModalOpen(true); };
  const handleEdit = (driver) => { setEditData(driver); setModalOpen(true); };
  const handleDelete = (driver) => { setDeleteTarget(driver); setDeleteModalOpen(true); };

  // Add or edit driver
  const handleSubmit = async (form) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('type', form.type);
      formData.append('phone', form.phone);
      formData.append('car_name', form.car_name);
      formData.append('car_number', form.car_number);
      formData.append('license_number', form.license_number);
      if (user?.id) formData.append('supplier_id', user.id);
      if (form.license_file) formData.append('license_file', form.license_file);
      // status is not always required by API, but we keep it for UI
      if (editData) {
        await put(`/api/supplier/shipping-drivers/${editData.id}`, { token, data: formData });
      } else {
        await post('/api/supplier/shipping-drivers', { token, data: formData });
      }
      setModalOpen(false);
      setEditData(null);
      fetchDrivers();
    } catch (err) {
      setError(err.message || 'Failed to save driver');
    } finally {
      setLoading(false);
    }
  };

  // Delete driver
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await del(`/api/supplier/shipping-drivers/${deleteTarget.id}`, { token });
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchDrivers();
    } catch (err) {
      setError(err.message || 'Failed to delete driver');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Status actions (simulate for now, as API may not support suspend/reactivate directly)
  const handleStatusAction = (driver, action) => {
    setDrivers(ds => ds.map(d => d.id === driver.id ? { ...d, status: action } : d));
  };

  // Unique warehouse list for filter
  const warehouseOptions = Array.from(new Set(drivers.map(d => d.warehouse).filter(Boolean)));

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-2 flex flex-col gap-6 animate-fadeIn">
      <h1 className="text-3xl font-extrabold mb-2 text-blue-700 tracking-tight drop-shadow flex items-center gap-3">
        <FiUserPlus className="text-blue-400" /> Delivery Personnel
      </h1>
      <div className="flex flex-wrap gap-3 mb-2 items-center bg-white rounded-xl shadow p-4 border border-gray-100">
        <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1 w-full sm:w-auto">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none px-2 py-2 min-w-[180px] w-full sm:w-auto"
          />
        </div>
        <select
          value={warehouseFilter}
          onChange={e => setWarehouseFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="">All Warehouses</option>
          {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <button
          onClick={handleAdd}
          className="ml-auto flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow hover:from-blue-600 hover:to-blue-800 transition"
        >
          <FiUserPlus /> Add New Delivery Person
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-100 overflow-x-auto">
        {error && <div className="text-red-600 font-bold mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center py-12 text-blue-600 font-bold text-lg">Loading...</div>
        ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-50 text-blue-700">
              <th className="py-3 px-3 text-left font-bold">Agent Name</th>
              <th className="py-3 px-3 text-left font-bold">Phone Number</th>
              <th className="py-3 px-3 text-left font-bold">Vehicle Info</th>
              <th className="py-3 px-3 text-left font-bold">Assigned Warehouse</th>
              <th className="py-3 px-3 text-left font-bold">Status</th>
              <th className="py-3 px-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedDrivers.map(driver => (
              <tr key={driver.id} className="border-b last:border-b-0 hover:bg-blue-50/40 transition">
                <td className="py-3 px-3 font-semibold text-gray-900">{driver.name}</td>
                <td className="py-3 px-3">{driver.phone}</td>
                <td className="py-3 px-3">{[driver.car_name, driver.car_number].filter(Boolean).join(', ')}</td>
                <td className="py-3 px-3">{driver.warehouse}</td>
                <td className="py-3 px-3">
                  <span className={`inline-block px-3 py-1 rounded-full border text-xs font-bold shadow-sm ${STATUS_STYLES[driver.status]}`}>{driver.status?.charAt(0).toUpperCase() + driver.status?.slice(1)}</span>
                </td>
                <td className="py-3 px-3 text-right flex gap-2 justify-end items-center">
                  <button onClick={() => handleEdit(driver)} title="Edit" className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition" aria-label="Edit"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(driver)} title="Delete" className="p-2 rounded-full hover:bg-red-100 text-red-600 transition" aria-label="Delete"><FiTrash2 /></button>
                  {driver.status === 'active' && (
                    <button onClick={() => handleStatusAction(driver, 'suspended')} title="Suspend" className="p-2 rounded-full hover:bg-orange-100 text-orange-500 transition" aria-label="Suspend"><FiPause /></button>
                  )}
                  {driver.status === 'inactive' && (
                    <button onClick={() => handleStatusAction(driver, 'active')} title="Reactivate" className="p-2 rounded-full hover:bg-green-100 text-green-600 transition" aria-label="Reactivate"><FiPlay /></button>
                  )}
                  {driver.status === 'suspended' && (
                    <button onClick={() => handleStatusAction(driver, 'active')} title="Reactivate" className="p-2 rounded-full hover:bg-green-100 text-green-600 transition" aria-label="Reactivate"><FiPlay /></button>
                  )}
                </td>
              </tr>
            ))}
            {pagedDrivers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">No delivery personnel found.</td>
              </tr>
            )}
          </tbody>
        </table>
        )}
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-600 font-bold disabled:opacity-60 shadow"
          >
            Previous
          </button>
          <span className="text-base font-semibold text-gray-700">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-5 py-2 rounded-lg bg-blue-500 text-white font-bold disabled:opacity-60 shadow"
          >
            Next
          </button>
        </div>
      </div>
      <DriverFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialData={editData} loading={loading} />
      <ConfirmDeleteModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} driverName={deleteTarget?.name} loading={deleteLoading} />
    </div>
  );
} 