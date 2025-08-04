import React, { useState, useEffect } from 'react';
import { get, post, put, del, patch } from '../../utils/api';
import { useToast } from '../../UI/Common/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../UI/Common/Modal';
import ConfirmModal from '../../UI/supplier/ConfirmModal';
import StatusBadge from '../../UI/supplier/StatusBadge';
import Spinner from '../../UI/supplier/Spinner';

function WarehouseFormModal({ open, onClose, onSubmit, initialData, loading }) {
  const [form, setForm] = useState({
    name: '',
    name_ar: '',
    address: '',
    address_ar: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (open) {
      setForm(initialData || { name: '', name_ar: '', address: '', address_ar: '', phone: '' });
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    
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
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.name_ar.trim()) newErrors.name_ar = 'Arabic name is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.address_ar.trim()) newErrors.address_ar = 'Arabic address is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (form.phone && !/^[0-9+\-\s()]+$/.test(form.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(form);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit Warehouse' : 'Add Warehouse'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-theme-text mb-2">
            Warehouse Name (English) *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Enter warehouse name in English"
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
              errors.name ? 'border-red-300' : ''
            }`}
          />
          {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="name_ar" className="block text-sm font-medium text-theme-text mb-2">
            Warehouse Name (Arabic) *
          </label>
          <input
            id="name_ar"
            name="name_ar"
            type="text"
            value={form.name_ar}
            onChange={handleChange}
            required
            placeholder="أدخل اسم المستودع بالعربية"
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
              errors.name_ar ? 'border-red-300' : ''
            }`}
            dir="rtl"
          />
          {errors.name_ar && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name_ar}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-theme-text mb-2">
            Address (English) *
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="Enter warehouse address in English"
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
              errors.address ? 'border-red-300' : ''
            }`}
          />
          {errors.address && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="address_ar" className="block text-sm font-medium text-theme-text mb-2">
            Address (Arabic) *
          </label>
          <input
            id="address_ar"
            name="address_ar"
            type="text"
            value={form.address_ar}
            onChange={handleChange}
            required
            placeholder="أدخل عنوان المستودع بالعربية"
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
              errors.address_ar ? 'border-red-300' : ''
            }`}
            dir="rtl"
          />
          {errors.address_ar && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.address_ar}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-theme-text mb-2">
            Phone Number *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="Enter phone number"
            className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
              errors.phone ? 'border-red-300' : ''
            }`}
          />
          {errors.phone && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="theme-button-secondary flex-1 py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="theme-button flex-1 py-2 sm:py-3 px-4 rounded-lg disabled:opacity-60 transition text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size={16} />
                <span>Saving...</span>
              </>
            ) : (
              initialData ? 'Update Warehouse' : 'Add Warehouse'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();
  const { token } = useAuth();

  // Fetch warehouses
  const fetchWarehouses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await get('/api/supplier/warehouses', { token });
      const warehousesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setWarehouses(warehousesData);
    } catch (err) {
      setError(err.message || 'Failed to load warehouses');
      toast.show(err.message || 'Failed to load warehouses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Handle form submission (create/update)
  const handleSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (editData) {
        // Update warehouse
        await put(`/api/supplier/warehouses/${editData.id}`, { data: formData, token });
        toast.show('Warehouse updated successfully!', 'success');
      } else {
        // Create warehouse
        await post('/api/supplier/warehouses', { data: formData, token });
        toast.show('Warehouse created successfully!', 'success');
      }
      
      setModalOpen(false);
      setEditData(null);
      fetchWarehouses(); // Refresh the list
    } catch (err) {
      toast.show(err.message || 'Failed to save warehouse', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await del(`/api/supplier/warehouses/${deleteTarget.id}`, { token });
      toast.show('Warehouse deleted successfully!', 'success');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchWarehouses(); // Refresh the list
    } catch (err) {
      toast.show(err.message || 'Failed to delete warehouse', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (warehouse) => {
    try {
      await patch(`/api/supplier/warehouses/${warehouse.id}/toggle`, { token });
      toast.show(`Warehouse ${warehouse.is_active ? 'deactivated' : 'activated'} successfully!`, 'success');
      fetchWarehouses(); // Refresh the list
    } catch (err) {
      toast.show(err.message || 'Failed to toggle warehouse status', 'error');
    }
  };

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (warehouse) => {
    setEditData(warehouse);
    setModalOpen(true);
  };

  const handleDeleteClick = (warehouse) => {
    setDeleteTarget(warehouse);
    setDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <Spinner size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-700">Warehouses</h1>
          <p className="text-theme-text-secondary mt-1 text-sm sm:text-base">Manage your warehouse locations</p>
        </div>
        <button
          onClick={handleAdd}
          className="theme-button px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Warehouse
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:border-red-700">
          <p className="text-red-600 dark:text-red-300 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block theme-card p-3 sm:p-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="theme-table-header text-primary-700">
              <th className="py-3 px-4 text-left font-semibold">Name</th>
              <th className="py-3 px-4 text-left font-semibold">Address</th>
              <th className="py-3 px-4 text-left font-semibold">Phone</th>
              <th className="py-3 px-4 text-left font-semibold">Status</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map(warehouse => (
              <tr key={warehouse.id} className="border-b border-theme-border last:border-b-0 hover:bg-theme-surface">
                <td className="py-3 px-4 font-semibold text-theme-text">{warehouse.name}</td>
                <td className="py-3 px-4 text-theme-text">{warehouse.address}</td>
                <td className="py-3 px-4 text-theme-text">{warehouse.phone}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    warehouse.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {warehouse.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(warehouse)}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        warehouse.is_active
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                      }`}
                      title={warehouse.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {warehouse.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(warehouse)}
                      className="text-primary-600 hover:text-primary-800 transition px-2 py-1"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(warehouse)}
                      className="text-red-600 hover:text-red-800 transition px-2 py-1"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {warehouses.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-theme-text-muted">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-lg font-medium">No warehouses found</p>
                    <p className="text-sm">Get started by adding your first warehouse</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {warehouses.map(warehouse => (
          <div key={warehouse.id} className="theme-card p-4 sm:p-6">
            <div className="space-y-3">
              {/* Warehouse Name and Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs font-medium text-theme-text-secondary mb-1">Warehouse Name</div>
                  <div className="text-sm font-medium text-theme-text">{warehouse.name}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  warehouse.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {warehouse.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Address */}
              <div>
                <div className="text-xs font-medium text-theme-text-secondary mb-1">Address</div>
                <div className="text-sm text-theme-text">{warehouse.address}</div>
              </div>

              {/* Phone */}
              <div>
                <div className="text-xs font-medium text-theme-text-secondary mb-1">Phone</div>
                <div className="text-sm text-theme-text">{warehouse.phone}</div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-theme-border">
                <div className="text-xs font-medium text-theme-text-secondary mb-2">Actions</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleToggleStatus(warehouse)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
                      warehouse.is_active
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={warehouse.is_active ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                    {warehouse.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(warehouse)}
                    className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-800 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(warehouse)}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm font-bold hover:bg-red-200 dark:hover:bg-red-800 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty State for Mobile */}
        {warehouses.length === 0 && !loading && (
          <div className="theme-card p-8 text-center text-theme-text-muted">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <p className="text-lg font-medium">No warehouses found</p>
                <p className="text-sm">Get started by adding your first warehouse</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <WarehouseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editData}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Warehouse"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={actionLoading}
      />
    </div>
  );
} 