import React, { useState, useEffect, useMemo } from 'react';
import ProductTable from '../../UI/supplier/ProductTable';
import Spinner from '../../UI/supplier/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { get, post, put, del } from '../../utils/api';
import { useToast } from '../../UI/Common/ToastContext';
import Modal from '../../UI/Common/Modal';
import ConfirmActionModal from '../../UI/supplier/ConfirmActionModal';
import Pagination from "../../UI/supplier/Pagination";
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

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
  const { t } = useSupplierTranslation();

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
        if (!value) return t('products.name_required');
        return '';
      case 'price':
        if (!value) return t('products.price_required');
        if (isNaN(value) || Number(value) < 0) return t('products.price_positive');
        return '';
      case 'discount':
        if (value === '') return t('products.discount_required');
        if (isNaN(value) || Number(value) < 0 || Number(value) > 100) return t('products.discount_range');
        return '';
      case 'description':
        if (!value) return t('products.description_required');
        return '';
      case 'category_id':
        if (!value) return t('products.category_required');
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
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setForm((prev) => ({ ...prev, [name]: fieldValue }));
    
    // Clear error when user starts typing - only if there's an error
    setFormErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.show(t('products.please_fix_errors'), 'error');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(form);
      toast.show(isEdit ? t('products.product_updated') : t('products.product_added'), 'success');
      onClose();
    } catch (err) {
      toast.show(err.message || t('products.failed_to_submit'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? t('products.edit_product') : t('products.add_new_product')} size="large">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6" noValidate>
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-2 text-theme-text">{t('products.product_name')}</label>
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base" 
            placeholder={t('products.product_name_placeholder')}
          />
          {formErrors.name && <div className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.name}</div>}
        </div>
        
        {/* Price and Discount */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-theme-text">{t('products.price')}</label>
            <input 
              name="price" 
              type="number" 
              min="0" 
              step="0.01"
              value={form.price} 
              onChange={handleChange} 
              required 
              className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base" 
              placeholder={t('products.price_placeholder')}
            />
            {formErrors.price && <div className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.price}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-theme-text">{t('products.discount')}</label>
            <input 
              name="discount" 
              type="number" 
              min="0" 
              max="100" 
              value={form.discount} 
              onChange={handleChange} 
              required 
              className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base" 
              placeholder={t('products.discount_placeholder')}
            />
            {formErrors.discount && <div className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.discount}</div>}
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2 text-theme-text">{t('products.description')}</label>
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            required 
            rows="4"
            className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base resize-none" 
            placeholder={t('products.description_placeholder')}
          />
          {formErrors.description && <div className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.description}</div>}
        </div>
        
        {/* Product Image URL */}
        <div>
          <label className="block text-sm font-medium mb-2 text-theme-text">{t('products.product_image_url')}</label>
          <input 
            name="product_url" 
            value={form.product_url} 
            onChange={handleChange} 
            className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base" 
            placeholder={t('products.product_image_url_placeholder')}
          />
          <p className="text-xs text-theme-text-secondary mt-1">{t('products.product_image_url_help')}</p>
        </div>
        
        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2 text-theme-text">{t('products.category')}</label>
          <select 
            name="category_id" 
            value={form.category_id} 
            onChange={handleChange} 
            required 
            className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
          >
            <option value="">{t('products.select_category')}</option>
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))
            ) : (
              <option value="" disabled>{t('products.no_categories_available')}</option>
            )}
          </select>
          {formErrors.category_id && <div className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.category_id}</div>}
          {categories && categories.length === 0 && (
            <div className="text-yellow-500 text-xs sm:text-sm mt-1 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              {t('products.no_categories_found')}
            </div>
          )}
        </div>
        
        {/* Active Status */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <input 
            id="is_active" 
            name="is_active" 
            type="checkbox" 
            checked={form.is_active} 
            onChange={handleChange} 
            className="w-4 h-4 focus:ring-2 focus:ring-primary-400 rounded" 
          />
          <label htmlFor="is_active" className="text-sm sm:text-base text-theme-text cursor-pointer">
            {t('products.product_active_status')}
          </label>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="theme-button-secondary flex-1 py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
          >
            {t('profile.cancel')}
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="theme-button flex-1 py-2 sm:py-3 px-4 rounded-lg disabled:opacity-60 transition text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {loading && <Spinner size={16} />}
            {loading ? t('products.processing') : (isEdit ? t('products.save_changes') : t('products.add_product'))}
          </button>
        </div>
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
  const { t } = useSupplierTranslation();
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
      setError(err.message || t('products.error_loading_products'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      // Use the public categories endpoint directly
      const res = await get('/api/v1/categories');
      const cats = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
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
      // Prepare the data as JSON (working version)
      const productData = {
        name: form.name,
        price: form.price,
        discount: form.discount || '0',
        description: form.description || '',
        product_url: form.product_url || null,
        category_id: form.category_id,
        supplier_id: user.id,
        is_active: form.is_active ? '1' : '0'
      };
      
      const res = await post('/api/supplier-management/products', { 
        token, 
        data: productData 
      });
      
      // Update the products list with the real data from server
      setProducts(products => [res.data, ...products.filter(p => p.id !== tempId)]);
      toast.show(t('products.product_added'), 'success');
    } catch (err) {
      // Revert optimistic update on error
      setProducts(prevProducts);
      console.error('Product creation error:', err);
      throw err; // Re-throw to be handled by the form
    }
  };

  // Edit product
  const handleEditProduct = async (form) => {
    // Optimistic UI: update product locally
    const prevProducts = products;
    setProducts(products.map(p => p.id === editData.id ? { ...p, ...form } : p));
    try {
      // Try using the exact same pattern as status toggle
      const updateData = {
        name: form.name,
        price: form.price,
        discount: form.discount || '0',
        description: form.description || '',
        product_url: form.product_url || null,
        category_id: form.category_id,
        is_active: form.is_active ? '1' : '0'
      };
      
      console.log('Sending minimal update data:', updateData);
      await put(`/api/supplier-management/products/${editData.id}`, { 
        token, 
        data: updateData 
      });
      toast.show(t('products.product_updated'), 'success');
    } catch (err) {
      // Revert optimistic update on error
      setProducts(prevProducts);
      console.error('Product update error:', err);
      throw err; // Re-throw to be handled by the form
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
      toast.show(t('products.product_deleted'), 'success');
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
      toast.show(t('products.product_status_updated'), 'success');
    } catch (err) {
      setProducts(prevProducts);
      setActionResult(prev => ({ ...prev, [product.id]: 'error' }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [product.id]: false }));
        setActionResult(prev => ({ ...prev, [product.id]: undefined }));
      }, 2000);
      toast.show(err.message || t('products.failed_to_update_status'), 'error');
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2 text-primary-700 tracking-tight drop-shadow flex items-center gap-3">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          {t('products.title')}
        </h1>
        <p className="text-theme-text-secondary text-sm sm:text-base">{t('products.subtitle')}</p>
      </div>
      
      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="w-full">
          <input
            type="text"
            placeholder={t('products.search_by_name_or_sku')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="theme-input px-3 sm:px-4 py-2 sm:py-3 rounded-lg w-full text-sm sm:text-base"
            aria-label="Search products"
          />
        </div>
        
        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="theme-input px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
            aria-label="Filter by category"
          >
            <option value="">{t('products.all_categories')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="theme-input px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
            aria-label="Filter by status"
          >
            <option value="">{t('products.all_statuses')}</option>
            <option value="active">{t('products.active')}</option>
            <option value="inactive">{t('products.inactive')}</option>
          </select>
        </div>
        
        {/* Add Product Button */}
        <div className="w-full">
          <button
            onClick={() => { setEditData(null); setModalOpen(true); }}
            className="theme-button px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('products.add_product')}
          </button>
        </div>
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-8 sm:py-12">
          <Spinner size={32} />
        </div>
      ) : error ? (
        <div className="flex justify-center py-8 sm:py-12 text-red-500 text-center px-4">
          <div>
            <div className="text-lg font-medium mb-2">{t('products.error_loading_products')}</div>
            <div className="text-sm text-theme-text-secondary">{error}</div>
          </div>
        </div>
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
          <div className="mt-6">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
      
      {/* Modals */}
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
        title={t('products.delete_product')}
        message={t('products.delete_product_confirmation', { name: deleteTarget?.name })}
        confirmText={t('products.delete_product')}
        confirmColor="red"
        loading={deleteLoading}
      />
    </div>
  );
} 