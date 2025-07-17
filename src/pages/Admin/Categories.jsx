import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get, post, put, del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Modal from '../../UI/Common/Modal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back.twryd.com';
function getIconUrl(icon) {
  if (!icon) return null;
  if (icon.startsWith('http')) return icon;
  return `${API_BASE_URL}/${icon.replace(/^\//, '')}`;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function CategoryFormModal({ open, onClose, onSubmit, initialData, isEdit }) {
  const [form, setForm] = useState({
    name: '',
    icon: null,
    is_active: true,
    remove_icon: false,
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const toast = useToast();

  React.useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || '',
        icon: null,
        is_active: initialData?.is_active ?? true,
        remove_icon: false,
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  function validateField(name, value, files) {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required.';
        return '';
      case 'icon': {
        const file = files ? files[0] : form.icon;
        if (!isEdit && !file) return 'Icon is required.';
        if (file && !file.type.startsWith('image/')) return 'Icon must be an image.';
        if (file && file.size > MAX_FILE_SIZE) return 'Icon must be less than 2MB.';
        return '';
      }
      default:
        return '';
    }
  }

  function validateAll() {
    const errors = {};
    errors.name = validateField('name', form.name);
    errors.icon = validateField('icon', form.icon);
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, icon: files[0] }));
      setFormErrors((prev) => ({ ...prev, icon: validateField('icon', '', files) }));
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.show('Please fix the errors in the form.', 'error');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (form.icon) formData.append('icon', form.icon);
      formData.append('is_active', form.is_active ? '1' : '0');
      if (isEdit && form.remove_icon) formData.append('remove_icon', '1');
      await onSubmit(formData);
      toast.show(isEdit ? 'Category updated!' : 'Category created!', 'success');
      onClose();
    } catch (err) {
      toast.show(err.message || 'Failed to submit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Category' : 'Add New Category'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
          {formErrors.name && <div className="text-red-500 text-xs mt-1">{formErrors.name}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Icon {isEdit ? '(optional)' : '(required)'}</label>
          <input name="icon" type="file" accept="image/*" onChange={handleChange} className="w-full" required={!isEdit} />
          {isEdit && initialData?.icon && (
            <div className="flex items-center gap-2 mt-2">
              <img src={getIconUrl(initialData.icon)} alt="icon" className="w-8 h-8 object-cover rounded" />
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" name="remove_icon" checked={form.remove_icon} onChange={handleChange} /> Remove icon
              </label>
            </div>
          )}
          {formErrors.icon && <div className="text-red-500 text-xs mt-1">{formErrors.icon}</div>}
        </div>
        <div className="flex items-center gap-2">
          <input id="is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} />
          <label htmlFor="is_active" className="text-sm">Active</label>
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 font-bold text-white rounded bg-blue-500 hover:bg-blue-600 transition disabled:opacity-60 mt-2">
          {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Category')}
        </button>
      </form>
    </Modal>
  );
}

function ConfirmDeleteModal({ open, onClose, onConfirm, categoryName, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Category">
      <h3 className="text-xl font-bold mb-6">Delete Category</h3>
      <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{categoryName}</span>?</p>
      <div className="flex gap-4 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

export default function Categories() {
  const { token } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const toast = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories', token],
    queryFn: async () => {
      if (!token || typeof token !== 'string' || token.length <= 10) {
        return [];
      }
      const res = await get('/api/v1/manage-categories', { token });
      const cats = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      return cats.map(cat => ({
        ...cat,
        is_active: cat.is_active === true || cat.is_active === 1 || cat.is_active === '1'
      }));
    },
    // enabled removed
  });

  const categories = data || [];
  const filteredCategories = categories;

  // Add category
  const handleAddCategory = async (formData) => {
    await post('/api/v1/manage-categories', { token, data: formData });
    await refetch();
  };

  // Edit category
  const handleEditCategory = async (formData) => {
    await put(`/api/v1/manage-categories/${editData.id}`, { token, data: formData });
    await refetch();
  };

  // Delete category
  const handleDeleteCategory = async () => {
    setDeleteLoading(true);
    try {
      await del(`/api/v1/manage-categories/${deleteTarget.id}`, { token });
      toast.show('Category deleted!', 'success');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      toast.show(err.message || 'Failed to delete', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Status toggle
  const handleToggleStatus = async (category) => {
    try {
      await put(`/api/v1/manage-categories/${category.id}`, {
        token,
        data: { is_active: !category.is_active },
      });
      await refetch();
    } catch (err) {
      toast.show(err.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div className="flex justify-center items-start min-h-[80vh] w-full py-8 px-2">
      <div className="w-full max-w-5xl flex flex-col gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-8 text-blue-700 flex items-center gap-2">
          <span className="inline-block bg-blue-100 text-blue-600 rounded-full px-2 sm:px-3 py-1 text-base sm:text-lg">Categories</span>
          <span className="text-gray-400 font-normal text-base sm:text-lg">Management</span>
        </h1>
        <div className="flex justify-end mb-2 sm:mb-4">
          <button
            className="flex items-center gap-2 px-3 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition text-sm sm:text-base"
            onClick={() => { setEditData(null); setModalOpen(true); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Category
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 overflow-x-auto border border-gray-100">
          {isLoading ? (
            <div className="flex flex-col items-center py-8 sm:py-16 text-blue-500">
              <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 mb-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              <span className="text-base sm:text-lg font-semibold">Loading categories...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8 sm:py-12">{error.message || error}</div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center py-8 sm:py-16 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0A9 9 0 11.75 12a9 9 0 0117.25 0z" /></svg>
              <span className="text-base sm:text-lg font-semibold">No categories found.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              {filteredCategories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 sm:gap-4 bg-gray-50 rounded-xl p-2 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition">
                  <div className="flex-shrink-0">
                    {cat.icon ? (
                      <img
                        src={getIconUrl(cat.icon)}
                        alt={cat.name}
                        className="w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 bg-white"
                        onError={e => { e.target.onerror = null; e.target.src = ''; e.target.parentNode.innerHTML = '<div class=\'w-10 h-10 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400\'>N/A</div>'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base sm:text-lg text-gray-800 truncate">{cat.name}</div>
                    <div className="mt-1">
                      <button
                        className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded text-xs font-semibold focus:outline-none ${cat.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}
                        onClick={() => handleToggleStatus(cat)}
                        title="Toggle status"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <button
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-bold transition"
                      onClick={() => { setEditData(cat); setModalOpen(true); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6a2 2 0 002-2v-6a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                      Edit
                    </button>
                    <button
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition"
                      onClick={() => { setDeleteTarget(cat); setDeleteModalOpen(true); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <CategoryFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={editData ? handleEditCategory : handleAddCategory}
          initialData={editData}
          isEdit={!!editData}
        />
        <ConfirmDeleteModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteCategory}
          categoryName={deleteTarget?.name}
          loading={deleteLoading}
        />
      </div>
    </div>
  );
} 