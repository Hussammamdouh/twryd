import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get, post, put, del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import Modal from '../../UI/Common/Modal';
import FileUpload from '../../UI/Common/FileUpload';

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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Category' : 'Add New Category'} size="large">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-theme-text mb-1">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input 
            id="name"
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            maxLength={50}
            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
              formErrors.name 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/30 focus:ring-red-400 focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}
            placeholder="Enter category name"
            aria-invalid={!!formErrors.name}
            aria-describedby={formErrors.name ? 'name-error' : undefined}
          />
          {formErrors.name && (
            <div id="name-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {formErrors.name}
            </div>
          )}
        </div>
        
        <FileUpload
          id="icon"
          name="icon"
          accept="image/*"
          required={!isEdit}
          onChange={handleChange}
          label={`Icon ${isEdit ? '(optional)' : '(required)'}`}
          error={formErrors.icon}
          maxSize={1 * 1024 * 1024} // 1MB
        />
        
        {isEdit && initialData?.icon && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <img src={getIconUrl(initialData.icon)} alt="Current icon" className="w-8 h-8 object-cover rounded" />
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input 
                type="checkbox" 
                name="remove_icon" 
                checked={form.remove_icon} 
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              /> 
              Remove current icon
            </label>
          </div>
        )}
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <input 
            id="is_active" 
            name="is_active" 
            type="checkbox" 
            checked={form.is_active} 
            onChange={handleChange} 
            className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active Category
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (Inactive categories won't appear in product listings)
          </span>
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
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Category')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ConfirmDeleteModal({ open, onClose, onConfirm, categoryName, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Category" size="medium">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Category</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{categoryName}</span>? 
          This action cannot be undone.
        </p>
        <div className="flex gap-4 w-full">
          <button 
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            className="flex-1 py-2 px-4 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-red-600 hover:bg-red-700 focus:bg-red-800 text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
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
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-2 md:px-0">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <span className="text-gray-900 dark:text-white">Categories</span>
            <span className="text-gray-500 dark:text-gray-400 font-normal text-lg sm:text-xl ml-2">Management</span>
          </div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Organize products with categories and manage their visibility</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} total
          </div>
          <button
            className="px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700 focus:bg-primary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 flex items-center gap-2"
            onClick={() => { setEditData(null); setModalOpen(true); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        {isLoading ? (
          <div className="flex flex-col items-center py-16">
            <svg className="animate-spin h-8 w-8 text-primary-500 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-gray-500 dark:text-gray-400 font-medium">Loading categories...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16">
            <svg className="h-8 w-8 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-500 font-medium">{error.message || error}</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0A9 9 0 11.75 12a9 9 0 0117.25 0z" />
            </svg>
            <span className="text-gray-500 dark:text-gray-400 font-medium mb-2">No categories found</span>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Get started by creating your first category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {cat.icon ? (
                      <img
                        src={getIconUrl(cat.icon)}
                        alt={cat.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                        onError={(e) => {
                          try {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const parent = e.target.parentNode;
                            if (parent) {
                              parent.innerHTML = '<div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">N/A</div>';
                            }
                          } catch (error) {
                            console.warn('Error handling image load failure:', error);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-2">{cat.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                          cat.is_active 
                            ? 'bg-green-100 text-green-700 focus:ring-green-400 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-600 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => handleToggleStatus(cat)}
                        title="Toggle status"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onClick={() => { setEditData(cat); setModalOpen(true); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 inline mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6a2 2 0 002-2v-6a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="flex-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                        onClick={() => { setDeleteTarget(cat); setDeleteModalOpen(true); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 inline mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
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
  );
} 