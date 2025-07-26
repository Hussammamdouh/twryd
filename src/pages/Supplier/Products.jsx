import React, { useState, useEffect, useMemo } from 'react';
import ProductTable from '../../UI/supplier/ProductTable';
import Spinner from '../../UI/supplier/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { get, post, put, del } from '../../utils/api';
import { useToast } from '../../UI/Common/ToastContext';
import Modal from '../../UI/Common/Modal';
import ConfirmActionModal from '../../UI/supplier/ConfirmActionModal';
import Pagination from "../../UI/supplier/Pagination";

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
            <label className="block text-sm font-medium mb-1 text-theme-text">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="theme-input w-full px-3 py-2 rounded" />
          {formErrors.name && <div className="text-red-500 text-xs mt-1">{formErrors.name}</div>}
          </div>
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1 text-theme-text">Price</label>
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className="theme-input w-full px-3 py-2 rounded" />
            {formErrors.price && <div className="text-red-500 text-xs mt-1">{formErrors.price}</div>}
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1 text-theme-text">Discount (%)</label>
              <input name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange} required className="theme-input w-full px-3 py-2 rounded" />
            {formErrors.discount && <div className="text-red-500 text-xs mt-1">{formErrors.discount}</div>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-theme-text">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required className="theme-input w-full px-3 py-2 rounded" />
          {formErrors.description && <div className="text-red-500 text-xs mt-1">{formErrors.description}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-theme-text">Product Image URL</label>
            <input name="product_url" value={form.product_url} onChange={handleChange} className="theme-input w-full px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-theme-text">Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required className="theme-input w-full px-3 py-2 rounded">
              <option value="">Select category</option>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))
              ) : (
                <option value="" disabled>No categories available</option>
              )}
            </select>
            {formErrors.category_id && <div className="text-red-500 text-xs mt-1">{formErrors.category_id}</div>}
            {categories && categories.length === 0 && (
              <div className="text-yellow-500 text-xs mt-1">No categories found. Please contact admin.</div>
            )}
          </div>
          <div className="flex items-center gap-2">
          <input id="is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} className="focus:ring-2 focus:ring-primary-400" />
            <label htmlFor="is_active" className="text-sm text-theme-text">Active</label>
          </div>
        <button type="submit" disabled={loading} className="theme-button w-full py-2 font-bold rounded transition disabled:opacity-60 mt-2">
            {loading ? <Spinner size={20} /> : (isEdit ? 'Save Changes' : 'Add Product')}
          </button>
        </form>
    </Modal>
  );
}

// --- Confirm Delete Modal ---


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
  const { token, user } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [actionResult, setActionResult] = useState({}); // { [productId]: 'success' | 'error' }


  // Fetch products
  const fetchProducts = async (pageNum = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await get(`/api/supplier-management/products?page=${pageNum}&per_page=10`, { token });
      // Handle both old format (res.data.products) and new format (res.data)
      const productsData = res.data?.data || res.data?.products?.data || res.data?.products || res.data || [];
      setProducts(productsData);
      setTotalPages(res.data?.last_page || res.data?.products?.last_page || 1);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await get('/api/client-management/available-categories');
      const cats = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setCategories(cats);
    } catch {
      // Fallback to public categories endpoint
      try {
        const fallbackRes = await get('/api/v1/categories');
        const fallbackCats = Array.isArray(fallbackRes.data) ? fallbackRes.data : (fallbackRes.data?.data || []);
        setCategories(fallbackCats);
      } catch {
        setCategories([]);
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts(page);
      fetchCategories();
    } else {
      fetchCategories();
    }
    // eslint-disable-next-line
  }, [token, page]);

  // Add product
  const handleAddProduct = async (form) => {
    // Optimistic UI: add product locally
    const tempId = Math.random().toString(36).slice(2);
    const newProduct = { ...form, id: tempId };
    const prevProducts = products;
    setProducts([newProduct, ...products]);
    try {
      // Create FormData as expected by the API
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('discount', form.discount || '0');
      formData.append('description', form.description || '');
      formData.append('product_url', form.product_url || '');
      formData.append('category_id', form.category_id);
      formData.append('supplier_id', user.id); // Add supplier_id from user context
      formData.append('is_active', form.is_active ? '1' : '0');
      
      const res = await post('/api/supplier-management/products', { token, data: formData });
      setProducts(products => [res.data, ...products.filter(p => p.id !== tempId)]);
      toast.show('Product added!', 'success');
    } catch (err) {
      setProducts(prevProducts);
      toast.show(err.message || 'Failed to add product', 'error');
    }
  };

  // Edit product
  const handleEditProduct = async (form) => {
    // Optimistic UI: update product locally
    const prevProducts = products;
    setProducts(products.map(p => p.id === editData.id ? { ...p, ...form } : p));
    try {
      // Create FormData for update
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('discount', form.discount || '0');
      formData.append('description', form.description || '');
      formData.append('product_url', form.product_url || '');
      formData.append('category_id', form.category_id);
      formData.append('supplier_id', user.id);
      formData.append('is_active', form.is_active ? '1' : '0');
      
      await put(`/api/supplier-management/products/${editData.id}`, { token, data: formData });
      toast.show('Product updated!', 'success');
    } catch (err) {
      setProducts(prevProducts);
      toast.show(err.message || 'Failed to update product', 'error');
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    setDeleteLoading(true);
    try {
      await del(`/api/supplier-management/products/${deleteTarget.id}`, { token });
      setProducts(products => products.filter(p => p.id !== deleteTarget.id));
      setRecentlyUpdated(prev => ({ ...prev, [deleteTarget.id]: true }));
      setActionResult(prev => ({ ...prev, [deleteTarget.id]: 'success' }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [deleteTarget.id]: false }));
        setActionResult(prev => ({ ...prev, [deleteTarget.id]: undefined }));
      }, 2000);
      toast.show('Product deleted!', 'success');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [deleteTarget.id]: true }));
      setActionResult(prev => ({ ...prev, [deleteTarget.id]: 'error' }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [deleteTarget.id]: false }));
        setActionResult(prev => ({ ...prev, [deleteTarget.id]: undefined }));
      }, 2000);
      toast.show(err.message || 'Failed to delete product', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Status toggle
  const handleToggleStatus = async (product) => {
    const prevProducts = products;
    setProducts(products.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
    setRecentlyUpdated(prev => ({ ...prev, [product.id]: true }));
    setActionResult(prev => ({ ...prev, [product.id]: undefined }));
    try {
      await put(`/api/supplier-management/products/${product.id}`, {
        token,
        data: { is_active: !product.is_active },
      });
      setActionResult(prev => ({ ...prev, [product.id]: 'success' }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [product.id]: false }));
        setActionResult(prev => ({ ...prev, [product.id]: undefined }));
      }, 2000);
      toast.show('Product status updated!', 'success');
    } catch (err) {
      setProducts(prevProducts);
      setActionResult(prev => ({ ...prev, [product.id]: 'error' }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [product.id]: false }));
        setActionResult(prev => ({ ...prev, [product.id]: undefined }));
      }, 2000);
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
      <h1 className="text-2xl font-bold mb-4 text-theme-text">My Products</h1>
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="theme-input px-3 py-2 rounded w-full"
            aria-label="Search products"
          />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="theme-input px-3 py-2 rounded"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="theme-input px-3 py-2 rounded"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          onClick={() => { setEditData(null); setModalOpen(true); }}
          className="theme-button px-5 py-2 rounded font-bold"
        >
          + Add Product
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : error ? (
        <div className="flex justify-center py-12 text-red-500">{error}</div>
      ) : (
        <>
          <ProductTable
            products={filteredProducts}
            loading={false}
            error={null}
            onEdit={product => { setEditData(product); setModalOpen(true); }}
            onDelete={product => { setDeleteTarget(product); setDeleteModalOpen(true); }}
            onToggleStatus={handleToggleStatus}
            categories={categories}
            recentlyUpdated={recentlyUpdated}
            actionResult={actionResult}
            deleteLoading={deleteLoading}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editData ? handleEditProduct : handleAddProduct}
        initialData={editData}
        categories={categories}
        isEdit={!!editData}
      />
      <ConfirmActionModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        confirmColor="red"
        loading={deleteLoading}
      />
    </div>
  );
} 