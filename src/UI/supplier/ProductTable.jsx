import React from 'react';

const ProductTable = function ProductTable({ products, loading, error, onEdit, onDelete, onToggleStatus, categories, recentlyUpdated = {}, actionResult = {}, deleteLoading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-8 sm:py-12 text-theme-text-secondary">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading products...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center py-8 sm:py-12 text-red-500 text-center px-4">
        <div>
          <div className="text-lg font-medium mb-2">Error Loading Products</div>
          <div className="text-sm text-theme-text-secondary">{error}</div>
        </div>
      </div>
    );
  }
  
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-theme-text-muted gap-4 px-4">
        <div className="text-center">
          <div className="text-lg sm:text-xl font-medium mb-2">No products found.</div>
          <p className="text-sm text-theme-text-secondary mb-4">Start by adding your first product to showcase to clients.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm bg-white dark:bg-gray-900" role="table" aria-label="Products Table">
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className={`theme-card p-4 sm:p-6 transition-all duration-300 ${recentlyUpdated[product.id] ? (actionResult[product.id] === 'success' ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20' : 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20') : ''}`}
          >
            <div className="space-y-3">
              {/* Product Name and Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs font-medium text-theme-text-secondary mb-1">Product Name</div>
                  <div className="text-sm font-medium text-theme-text">{product.name}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* SKU and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-theme-text-secondary mb-1">SKU</div>
                  <div className="text-sm text-theme-text">{product.sku}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-theme-text-secondary mb-1">Category</div>
                  <div className="text-sm text-theme-text">{categories.find(c => c.id === product.category_id)?.name || 'N/A'}</div>
                </div>
              </div>

              {/* Price and Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-theme-text-secondary mb-1">Price</div>
                  <div className="text-sm font-medium text-theme-text">${parseFloat(product.price || 0).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-theme-text-secondary mb-1">Discount</div>
                  <div className="text-sm text-theme-text">{product.discount ? `${product.discount}%` : '-'}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-theme-border">
                <div className="text-xs font-medium text-theme-text-secondary mb-2">Actions</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg shadow text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
                    onClick={() => onEdit(product)}
                    aria-label={`Edit product ${product.name}`}
                    tabIndex={0}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg shadow text-sm font-bold hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2"
                    onClick={() => onDelete(product)}
                    aria-label={`Delete product ${product.name}`}
                    tabIndex={0}
                    disabled={deleteLoading && recentlyUpdated[product.id]}
                  >
                    {deleteLoading && recentlyUpdated[product.id] ? (
                      <svg className="w-4 h-4 animate-spin text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    Delete
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg shadow text-sm font-bold focus:outline-none focus:ring-2 flex items-center gap-2 ${
                      product.is_active 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 focus:ring-gray-400' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 focus:ring-green-400'
                    }`}
                    onClick={() => onToggleStatus(product)}
                    aria-label={product.is_active ? `Deactivate product ${product.name}` : `Activate product ${product.name}`}
                    tabIndex={0}
                    disabled={recentlyUpdated[product.id] && actionResult[product.id] === undefined}
                  >
                    {recentlyUpdated[product.id] && actionResult[product.id] === undefined ? (
                      <svg className="w-4 h-4 animate-spin text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={product.is_active ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                      </svg>
                    )}
                    {product.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
                
                {/* Action Result Indicators */}
                <div className="flex items-center gap-2 mt-2">
                  {actionResult[product.id] === 'success' && !deleteLoading && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Success
                    </div>
                  )}
                  {actionResult[product.id] === 'error' && !deleteLoading && (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Error
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ProductTable); 