import React, { useState, useEffect, useMemo } from 'react';
import ProductTable from '../../UI/supplier/ProductTable';
import Spinner from '../../UI/supplier/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { get, post, put, del } from '../../utils/api';
import { useToast } from '../../UI/Common/ToastContext';
import Modal from '../../UI/Common/Modal';

// --- Add/Edit Product Modal ---
function ProductFormModal({ open, onClose, onSubmit, initialData, categories, isEdit }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    discount: '',
    description: '',
    product_url: '',
    category_id: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || '',
        price: initialData?.price || '',
        discount: initialData?.discount || '',
        description: initialData?.description || '',
        product_url: initialData?.product_url || '',
        category_id: initialData?.category_id || '',
        is_active: initialData?.is_active ?? true,
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  function validateField(name, value) {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required.';
        return '';
      case 'price':
        if (!value) return 'Price is required.';
        if (isNaN(value) || Number(value) < 0) return 'Price must be a positive number.';
        return '';
      case 'discount':
        if (value === '') return 'Discount is required.';
        if (isNaN(value) || Number(value) < 0 || Number(value) > 100) return 'Discount must be 0-100.';
        return '';
      case 'description':
        if (!value) return 'Description is required.';
        return '';
      case 'category_id':
        if (!value) return 'Category is required.';
        return '';
      default:
        return '';
    }
  }

  function validateAll() {
    const errors = {};
    errors.name = validateField('name', form.name);
    errors.price = validateField('price', form.price);
    errors.discount = validateField('discount', form.discount);
    errors.description = validateField('description', form.description);
    errors.category_id = validateField('category_id', form.category_id);
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, type === 'checkbox' ? checked : value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.show('Please fix the errors in the form.', 'error');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(form);
      toast.show(isEdit ? 'Product updated!' : 'Product added!', 'success');
      onClose();
    } catch (err) {
      toast.show(err.message || 'Failed to submit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add New Product'} className="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
          {formErrors.name && <div className="text-red-500 text-xs mt-1">{formErrors.name}</div>}
        </div>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Price</label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
            {formErrors.price && <div className="text-red-500 text-xs mt-1">{formErrors.price}</div>}
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Discount (%)</label>
            <input name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
            {formErrors.discount && <div className="text-red-500 text-xs mt-1">{formErrors.discount}</div>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
          {formErrors.description && <div className="text-red-500 text-xs mt-1">{formErrors.description}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Product Image URL</label>
          <input name="product_url" value={form.product_url} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select name="category_id" value={form.category_id} onChange={handleChange} required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400">
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {formErrors.category_id && <div className="text-red-500 text-xs mt-1">{formErrors.category_id}</div>}
        </div>
        <div className="flex items-center gap-2">
          <input id="is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} />
          <label htmlFor="is_active" className="text-sm">Active</label>
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 font-bold text-white rounded bg-blue-500 hover:bg-blue-600 transition disabled:opacity-60 mt-2">
          {loading ? <Spinner size={20} /> : (isEdit ? 'Save Changes' : 'Add Product')}
        </button>
      </form>
    </Modal>
  );
}

// --- Confirm Delete Modal ---
function ConfirmDeleteModal({ open, onClose, onConfirm, productName, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Product">
      <h3 className="text-xl font-bold mb-6">Delete Product</h3>
      <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{productName}</span>?</p>
      <div className="flex gap-4 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">
          {loading ? <Spinner size={18} /> : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { token } = useAuth();
  const toast = useToast();

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get('/api/supplier-management/products', { token });
      setProducts(res.data?.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await get('/api/v1/categories');
      setCategories(res.data?.data || []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
    fetchCategories();
    // eslint-disable-next-line
  }, [token]);

  // Add product
  const handleAddProduct = async (form) => {
    await post('/api/supplier-management/products', { token, data: form });
    await fetchProducts();
  };

  // Edit product
  const handleEditProduct = async (form) => {
    await put(`/api/supplier-management/products/${editData.id}`, { token, data: form });
    await fetchProducts();
  };

  // Delete product
  const handleDeleteProduct = async () => {
    setDeleteLoading(true);
    try {
      await del(`/api/supplier-management/products/${deleteTarget.id}`, { token });
      toast.show('Product deleted!', 'success');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await fetchProducts();
    } catch (err) {
      toast.show(err.message || 'Failed to delete', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Status toggle
  const handleToggleStatus = async (product) => {
    try {
      await put(`/api/supplier-management/products/${product.id}`, {
        token,
        data: { is_active: !product.is_active },
      });
      await fetchProducts();
    } catch (err) {
      toast.show(err.message || 'Failed to update status', 'error');
    }
  };

  // Search & filter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !search ||
        (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !filterCategory || String(p.category_id) === String(filterCategory);
      const matchesStatus = !filterStatus || (filterStatus === 'active' ? p.is_active : !p.is_active);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, filterCategory, filterStatus]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Products</h1>
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 w-full"
          />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          onClick={() => { setEditData(null); setModalOpen(true); }}
          className="px-5 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : error ? (
        <div className="flex justify-center py-12 text-red-500">{error}</div>
      ) : (
        <ProductTable
          products={filteredProducts}
          loading={false}
          error={null}
          onEdit={product => { setEditData(product); setModalOpen(true); }}
          onDelete={product => { setDeleteTarget(product); setDeleteModalOpen(true); }}
          onToggleStatus={handleToggleStatus}
          categories={categories}
        />
      )}
      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editData ? handleEditProduct : handleAddProduct}
        initialData={editData}
        categories={categories}
        isEdit={!!editData}
      />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        productName={deleteTarget?.name}
        loading={deleteLoading}
      />
    </div>
  );
} 