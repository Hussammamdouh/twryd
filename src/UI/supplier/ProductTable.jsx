import React from 'react';

const ProductTable = function ProductTable({ products, loading, error, onEdit, onDelete, onToggleStatus, categories, recentlyUpdated = {}, actionResult = {}, deleteLoading }) {
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
    <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
      <table className="min-w-full text-sm md:table bg-white dark:bg-gray-900" role="table" aria-label="Products Table">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200" role="row">
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Product Name</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">SKU</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Category</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Price</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Discount</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Status</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900" role="rowgroup">
          {products.map((product) => (
            <tr
              key={product.id}
              className={`border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 ${recentlyUpdated[product.id] ? (actionResult[product.id] === 'success' ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20' : 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20') : ''}`}
              role="row"
              tabIndex={0}
              aria-label={`Product: ${product.name}, SKU: ${product.sku}`}
            >
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{product.name}</td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{product.sku}</td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{categories.find(c => c.id === product.category_id)?.name || 'N/A'}</td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">${parseFloat(product.price || 0).toFixed(2)}</td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{product.discount ? `${product.discount}%` : '-'}</td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                  aria-label={product.is_active ? 'Active' : 'Inactive'}>{product.is_active ? 'Active' : 'Inactive'}</span>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap flex flex-wrap gap-2 items-center">
                <button
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded shadow text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => onEdit(product)}
                  aria-label={`Edit product ${product.name}`}
                  tabIndex={0}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded shadow text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                  onClick={() => onDelete(product)}
                  aria-label={`Delete product ${product.name}`}
                  tabIndex={0}
                  disabled={deleteLoading && recentlyUpdated[product.id]}
                >
                  {deleteLoading && recentlyUpdated[product.id] ? (
                    <svg className="w-4 h-4 animate-spin text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : 'Delete'}
                </button>
                <button
                  className={`px-3 py-1 ${product.is_active ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'} rounded shadow text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400`}
                  onClick={() => onToggleStatus(product)}
                  aria-label={product.is_active ? `Deactivate product ${product.name}` : `Activate product ${product.name}`}
                  tabIndex={0}
                  disabled={recentlyUpdated[product.id] && actionResult[product.id] === undefined}
                >
                  {recentlyUpdated[product.id] && actionResult[product.id] === undefined ? (
                    <svg className="w-4 h-4 animate-spin text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : product.is_active ? 'Deactivate' : 'Activate'}
                </button>
                {actionResult[product.id] === 'success' && !deleteLoading && (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {actionResult[product.id] === 'error' && !deleteLoading && (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(ProductTable); 