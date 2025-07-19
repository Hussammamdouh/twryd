import React from 'react';

const ProductTable = function ProductTable({ products, loading, error, onEdit, onDelete, onToggleStatus, categories }) {
  const getCategoryName = (id) => {
    const cat = categories?.find((c) => String(c.id) === String(id));
    return cat ? cat.name : id || 'N/A';
  };

  if (loading) {
    return <div className="flex justify-center py-12 text-theme-text-secondary">Loading products...</div>;
  }
  if (error) {
    return <div className="flex justify-center py-12 text-red-500">{error}</div>;
  }
  if (!products || products.length === 0) {
    return <div className="flex justify-center py-12 text-theme-text-muted">No products found.</div>;
  }
  return (
    <div className="theme-table overflow-x-auto rounded-lg shadow">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="theme-table-header text-theme-text">
            <th className="px-6 py-3 text-left font-semibold">Image</th>
            <th className="px-6 py-3 text-left font-semibold">Name</th>
            <th className="px-6 py-3 text-left font-semibold">Price</th>
            <th className="px-6 py-3 text-left font-semibold">Discount</th>
            <th className="px-6 py-3 text-left font-semibold">Description</th>
            <th className="px-6 py-3 text-left font-semibold">Category</th>
            <th className="px-6 py-3 text-left font-semibold">Status</th>
            <th className="px-6 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-theme-border last:border-0">
              <td className="px-6 py-4">
                {product.product_url ? (
                  <img src={product.product_url} alt={product.name} className="w-12 h-12 object-cover rounded" />
                ) : (
                  <div className="w-12 h-12 bg-theme-surface rounded flex items-center justify-center text-theme-text-muted">N/A</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-theme-text">{product.name}</td>
              <td className="px-6 py-4 text-theme-text">${product.price}</td>
              <td className="px-6 py-4 text-theme-text">{product.discount}%</td>
              <td className="px-6 py-4 max-w-xs truncate text-theme-text" title={product.description}>{product.description}</td>
              <td className="px-6 py-4 text-theme-text">{getCategoryName(product.category_id)}</td>
              <td className="px-6 py-4">
                <button
                  className={`px-3 py-1 rounded text-xs font-semibold focus:outline-none ${
                    product.is_active 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => onToggleStatus && onToggleStatus(product)}
                  title="Toggle status"
                >
                  {product.is_active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="px-6 py-4 flex gap-2">
                <button
                  className="px-2 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded text-xs font-bold"
                  onClick={() => onEdit && onEdit(product)}
                >Edit</button>
                <button
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold"
                  onClick={() => onDelete && onDelete(product)}
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(ProductTable); 