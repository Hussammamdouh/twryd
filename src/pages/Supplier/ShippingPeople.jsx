import React, { useState, useEffect } from 'react';
import { FiSearch, FiUserPlus, FiEdit2, FiTrash2, FiPause, FiPlay } from 'react-icons/fi';
import { get, post, put, del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../UI/Common/Modal';
import FileUpload from '../../UI/Common/FileUpload';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 border-green-300',
  inactive: 'bg-gray-100 text-gray-500 border-gray-300',
  suspended: 'bg-red-100 text-red-700 border-red-300',
};

function DriverFormModal({ open, onClose, onSubmit, initialData, loading, warehouses }) {
  const [form, setForm] = useState(
    initialData || { name: '', name_ar: '', type: '', type_ar: '', phone: '', car_name: '', car_number: '', license_number: '', warehouse: '', status: 'active', license_file: null }
  );

  useEffect(() => {
    if (open) setForm(initialData || { name: '', name_ar: '', type: '', type_ar: '', phone: '', car_name: '', car_number: '', license_number: '', warehouse: '', status: 'active', license_file: null });
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
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit Delivery Person' : 'Add New Delivery Person'} size="large">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-text mb-1">Full Name (English) *</label>
            <input 
              name="name" 
              placeholder="Enter full name in English" 
              value={form.name} 
              onChange={handleChange} 
              className="theme-input w-full px-3 py-2 rounded-lg text-sm" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-theme-text mb-1">Full Name (Arabic) *</label>
            <input 
              name="name_ar" 
              placeholder="أدخل الاسم الكامل بالعربية" 
              value={form.name_ar} 
              onChange={handleChange} 
              className="theme-input w-full px-3 py-2 rounded-lg text-sm" 
              required 
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-text mb-1">Type (English) *</label>
            <input 
              name="type" 
              placeholder="Driver, Delivery Person, etc." 
              value={form.type} 
              onChange={handleChange} 
              className="theme-input w-full px-3 py-2 rounded-lg text-sm" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-theme-text mb-1">Type (Arabic) *</label>
            <input 
              name="type_ar" 
              placeholder="سائق، موظف توصيل، إلخ" 
              value={form.type_ar} 
              onChange={handleChange} 
              className="theme-input w-full px-3 py-2 rounded-lg text-sm" 
              required 
              dir="rtl"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-theme-text mb-1">Phone Number *</label>
          <input 
            name="phone" 
            placeholder="Enter phone number" 
            value={form.phone} 
            onChange={handleChange} 
            className="theme-input w-full px-3 py-2 rounded-lg text-sm" 
            required 
          />
        </div>
        
        {/* Vehicle Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-text mb-1">Car Name/Model</label>
            <input 
              name="car_name" 
              placeholder="Car name or model" 
              value={form.car_name} 
              onChange={handleChange} 
              className="theme-input w-full px-3 py-2 rounded-lg text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-text mb-1">Car Number/Plate</label>
            <input 
              name="car_number" 
              placeholder="License plate number" 
              value={form.car_number} 
              onChange={handleChange} 
              className="theme-input w-full px-3 py-2 rounded-lg text-sm" 
            />
          </div>
        </div>
        
        {/* License and Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-text mb-1">License Number</label>
            <input 
              name="license_number" 
              placeholder="Driver license number" 
              value={form.license_number} 
              onChange={handleChange} 
              className="theme-input w-full px-3 py-2 rounded-lg text-sm" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-theme-text mb-1">Status</label>
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange} 
              className="theme-input w-full px-3 py-2 rounded-lg text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-theme-text mb-1">Assigned Warehouse</label>
          <select 
            name="warehouse" 
            value={form.warehouse} 
            onChange={handleChange} 
            className="theme-input w-full px-3 py-2 rounded-lg text-sm"
          >
            <option value="">Select Warehouse</option>
            {warehouses?.length > 0 ? (
              warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))
            ) : (
              <option value="" disabled>No warehouses available</option>
            )}
          </select>
          {warehouses?.length === 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              No warehouses found. Please create warehouses first in the Warehouses section.
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-theme-text mb-1">License File</label>
          <FileUpload
            name="license_file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
            label="Upload License File"
            required={false}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="theme-button-secondary flex-1 py-2 px-4 rounded-lg transition text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="theme-button flex-1 py-2 px-4 rounded-lg transition disabled:opacity-60 shadow flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              initialData ? 'Save Changes' : 'Add Delivery Person'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ConfirmDeleteModal({ open, onClose, onConfirm, driverName, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Delivery Person">
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <FiTrash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-red-700 dark:text-red-400">Delete Delivery Person</h3>
          <p className="text-theme-text text-sm">
            Are you sure you want to delete <span className="font-semibold">{driverName}</span>? This action cannot be undone.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            onClick={onClose} 
            className="theme-button-secondary flex-1 px-4 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 shadow text-sm flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          {loading ? 'Deleting...' : 'Delete'}
        </button>
        </div>
      </div>
    </Modal>
  );
}

export default function ShippingPeople() {
  const { token, user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
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

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const res = await get('/api/supplier/warehouses', { token });
      const warehousesData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setWarehouses(warehousesData);
    } catch {
      setWarehouses([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDrivers();
      fetchWarehouses();
    }
    // eslint-disable-next-line
  }, [token]);

  // Pagination logic (client-side for now)
  const perPage = 4;
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.phone?.includes(search);
    const matchesWarehouse = !warehouseFilter || String(d.warehouse) === String(warehouseFilter);
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
    const prevDrivers = drivers;
    if (editData) {
      // Optimistic UI: update driver locally
      setDrivers(drivers.map(d => d.id === editData.id ? { ...d, ...form } : d));
      try {
        // Update existing driver
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('name_ar', form.name_ar);
        formData.append('type', form.type);
        formData.append('type_ar', form.type_ar);
        formData.append('phone', form.phone);
        formData.append('car_name', form.car_name);
        formData.append('car_number', form.car_number);
        formData.append('license_number', form.license_number);
        formData.append('warehouse_id', form.warehouse);
        if (user?.id) formData.append('supplier_id', user.id);
        if (form.license_file) formData.append('license_file', form.license_file);
        if (form.status) formData.append('status', form.status);
        await put(`/api/supplier/shipping-drivers/${editData.id}`, { token, data: formData });
        setModalOpen(false);
        setEditData(null);
      } catch (err) {
        setDrivers(prevDrivers);
        setError(err.message || 'Failed to save driver');
      } finally {
        setLoading(false);
      }
    } else {
      // Optimistic UI: add driver locally
      const tempId = Math.random().toString(36).slice(2);
      const newDriver = { ...form, id: tempId };
      setDrivers([newDriver, ...drivers]);
      try {
        // Create new driver
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('name_ar', form.name_ar);
        formData.append('type', form.type);
        formData.append('type_ar', form.type_ar);
        formData.append('phone', form.phone);
        formData.append('car_name', form.car_name);
        formData.append('car_number', form.car_number);
        formData.append('license_number', form.license_number);
        formData.append('warehouse_id', form.warehouse);
        if (user?.id) formData.append('supplier_id', user.id);
        if (form.license_file) formData.append('license_file', form.license_file);
        if (form.status) formData.append('status', form.status);
        const res = await post('/api/supplier/shipping-drivers', { token, data: formData });
        setDrivers(drivers => [res.data, ...drivers.filter(d => d.id !== tempId)]);
        setModalOpen(false);
        setEditData(null);
      } catch (err) {
        setDrivers(prevDrivers);
        setError(err.message || 'Failed to save driver');
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete driver
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    const prevDrivers = drivers;
    setDrivers(drivers.filter(d => d.id !== deleteTarget.id));
    try {
      await del(`/api/supplier/shipping-drivers/${deleteTarget.id}`, { token });
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      setDrivers(prevDrivers);
      setError(err.message || 'Failed to delete driver');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Status actions (simulate for now, as API may not support suspend/reactivate directly)
  const handleStatusAction = (driver, action) => {
    setDrivers(ds => ds.map(d => d.id === driver.id ? { ...d, status: action } : d));
    // If you want to call an API, do it here and revert on error
    // Example:
    // try {
    //   await post(`/api/supplier/shipping-drivers/${driver.id}/status`, { token, data: { status: action } });
    // } catch (err) {
    //   setDrivers(prevDrivers);
    //   setError(err.message || 'Failed to update status');
    // }
  };

  // Unique warehouse list for filter
  const warehouseOptions = warehouses.map(w => ({ id: w.id, name: w.name }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2 text-primary-700 tracking-tight drop-shadow flex items-center gap-3">
          <FiUserPlus className="text-primary-400 w-6 h-6 sm:w-8 sm:h-8" /> 
          Delivery Personnel
      </h1>
        <p className="text-theme-text-secondary text-sm sm:text-base">Manage your delivery drivers and personnel</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="w-full">
          <div className="flex items-center bg-theme-surface rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full">
            <FiSearch className="text-theme-text-muted mr-2 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none px-2 py-1 min-w-[180px] w-full focus:ring-2 focus:ring-primary-400 rounded text-theme-text text-sm sm:text-base"
            aria-label="Search delivery personnel"
          />
          </div>
        </div>
        
        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <select
          value={warehouseFilter}
          onChange={e => setWarehouseFilter(e.target.value)}
            className="theme-input px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
          aria-label="Filter by warehouse"
        >
          <option value="">All Warehouses</option>
          {warehouseOptions.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
            className="theme-input px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        </div>
        
        {/* Add Button */}
        <div className="w-full">
        <button
          onClick={handleAdd}
            className="theme-button w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold shadow text-sm sm:text-base"
        >
            <FiUserPlus className="w-4 h-4 sm:w-5 sm:h-5" /> 
            Add New Delivery Person
        </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:border-red-700">
          <p className="text-red-600 dark:text-red-300 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block theme-card p-4 sm:p-6 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-8 sm:py-12 text-primary-600 font-bold text-lg">Loading...</div>
        ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="theme-table-header text-primary-700">
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
              <tr key={driver.id} className="border-b border-theme-border last:border-b-0 hover:bg-theme-surface transition">
                <td className="py-3 px-3 font-semibold text-theme-text">{driver.name}</td>
                <td className="py-3 px-3 text-theme-text">{driver.phone}</td>
                <td className="py-3 px-3 text-theme-text">{[driver.car_name, driver.car_number].filter(Boolean).join(', ')}</td>
                <td className="py-3 px-3 text-theme-text">
                  {warehouses.find(w => w.id === driver.warehouse)?.name || driver.warehouse || 'Not Assigned'}
                </td>
                <td className="py-3 px-3">
                  <span className={`inline-block px-3 py-1 rounded-full border text-xs font-bold shadow-sm ${STATUS_STYLES[driver.status] || STATUS_STYLES.inactive} dark:bg-opacity-30`}>
                    {driver.status ? (driver.status.charAt(0).toUpperCase() + driver.status.slice(1)) : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-3 text-right flex gap-2 justify-end items-center">
                  <button onClick={() => handleEdit(driver)} title="Edit" className="p-2 rounded-full hover:bg-primary-100 text-primary-600 transition" aria-label="Edit"><FiEdit2 /></button>
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
                <td colSpan={6} className="py-12 text-center text-theme-text-muted">No delivery personnel found.</td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center py-8 sm:py-12 text-primary-600 font-bold text-lg">Loading...</div>
        ) : (
          <>
            {pagedDrivers.map(driver => (
              <div key={driver.id} className="theme-card p-4 sm:p-6">
                <div className="space-y-3">
                  {/* Driver Name and Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-theme-text-secondary mb-1">Agent Name</div>
                      <div className="text-sm font-medium text-theme-text">{driver.name}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[driver.status] || STATUS_STYLES.inactive} dark:bg-opacity-30`}>
                      {driver.status ? (driver.status.charAt(0).toUpperCase() + driver.status.slice(1)) : 'Inactive'}
                    </span>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <div className="text-xs font-medium text-theme-text-secondary mb-1">Phone Number</div>
                    <div className="text-sm text-theme-text">{driver.phone}</div>
                  </div>

                  {/* Vehicle Info */}
                  <div>
                    <div className="text-xs font-medium text-theme-text-secondary mb-1">Vehicle Info</div>
                    <div className="text-sm text-theme-text">
                      {[driver.car_name, driver.car_number].filter(Boolean).join(', ') || 'No vehicle info'}
                    </div>
                  </div>

                  {/* Assigned Warehouse */}
                  <div>
                    <div className="text-xs font-medium text-theme-text-secondary mb-1">Assigned Warehouse</div>
                    <div className="text-sm text-theme-text">
                      {warehouses.find(w => w.id === driver.warehouse)?.name || driver.warehouse || 'Not Assigned'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-theme-border">
                    <div className="text-xs font-medium text-theme-text-secondary mb-2">Actions</div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleEdit(driver)} 
                        className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-800 transition flex items-center gap-2"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(driver)} 
                        className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm font-bold hover:bg-red-200 dark:hover:bg-red-800 transition flex items-center gap-2"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete
                      </button>
                      {driver.status === 'active' && (
                        <button 
                          onClick={() => handleStatusAction(driver, 'suspended')} 
                          className="px-3 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-bold hover:bg-orange-200 dark:hover:bg-orange-900/50 transition flex items-center gap-2"
                        >
                          <FiPause className="w-4 h-4" />
                          Suspend
                        </button>
                      )}
                      {(driver.status === 'inactive' || driver.status === 'suspended') && (
                        <button 
                          onClick={() => handleStatusAction(driver, 'active')} 
                          className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition flex items-center gap-2"
                        >
                          <FiPlay className="w-4 h-4" />
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Empty State for Mobile */}
            {pagedDrivers.length === 0 && (
              <div className="theme-card p-8 text-center text-theme-text-muted">
                <div className="flex flex-col items-center gap-3">
                  <FiUserPlus className="w-12 h-12 text-theme-text-muted" />
                  <div>
                    <p className="text-lg font-medium">No delivery personnel found</p>
                    <p className="text-sm">Get started by adding your first delivery person</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

        {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="theme-button-secondary px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold disabled:opacity-60 shadow text-sm sm:text-base"
          >
            Previous
          </button>
          <span className="text-sm sm:text-base font-semibold text-theme-text">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="theme-button px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold disabled:opacity-60 shadow text-sm sm:text-base"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <DriverFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialData={editData} loading={loading} warehouses={warehouses} />
      <ConfirmDeleteModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} driverName={deleteTarget?.name} loading={deleteLoading} />
    </div>
  );
} 