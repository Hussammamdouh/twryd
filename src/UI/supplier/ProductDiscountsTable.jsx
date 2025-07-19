import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Common/ToastContext';
import ConfirmModal from './ConfirmModal';
import Spinner from './Spinner';
import EditProductDiscountModal from './EditProductDiscountModal';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '-';
  }
};

export default function ProductDiscountsTable({ productDiscounts, loading, onAction, onAdd }) {
  const { token } = useAuth();
  const [rowLoading, setRowLoading] = useState({});
  const [confirm, setConfirm] = useState({ open: false, type: '', discount: null });
  const [editModal, setEditModal] = useState({ open: false, discount: null });
  const toast = useToast();

  const handleAction = async (type, discount) => {
    setRowLoading(l => ({ ...l, [discount.id]: true }));
    try {
      if (type === 'delete') {
        await del(`/api/supplier-management/products/${discount.product.id}/clients/${discount.client.id}/default-discount`, { token });
        toast.show('Product discount removed successfully', 'success');
      }
      onAction?.();
    } catch (err) {
      toast.show(err.message || 'Action failed', 'error');
    } finally {
      setRowLoading(l => ({ ...l, [discount.id]: false }));
      setConfirm({ open: false, type: '', discount: null });
    }
  };

  const openConfirm = (type, discount) => setConfirm({ open: true, type, discount });
  const closeConfirm = () => setConfirm({ open: false, type: '', discount: null });
  const openEditModal = (discount) => setEditModal({ open: true, discount });
  const closeEditModal = () => setEditModal({ open: false, discount: null });

  const confirmMessage = {
    delete: 'Are you sure you want to remove this product discount?'
  };

  if (loading) {
    return <div className="flex justify-center py-12 text-gray-500"><Spinner size={24} /></div>;
  }

  if (!productDiscounts || productDiscounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4">
        <div>No product discounts found.</div>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          onClick={onAdd}
        >
          + Add Product Discount
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow bg-white">
      <table className="min-w-full text-sm md:table">
        <thead>
          <tr className="bg-gray-50 text-gray-700">
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Product Name</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Discount %</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Applies To</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Start Date</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Expiry Date</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Status</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {productDiscounts.map((discount) => (
            <tr key={discount.id} className="border-b last:border-0">
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-900">
                    {discount.product?.name || 'N/A'}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {discount.product?.category?.name || 'No category'}
                  </div>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                {discount.discount ? `${discount.discount}%` : 'No discount'}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-900">
                    {discount.client?.name || discount.client?.company_name || 'N/A'}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {discount.client?.email || 'No email'}
                  </div>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                {formatDate(discount.start_date)}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                {formatDate(discount.expiry_date)}
              </td>
              <td className="px-4 md:px-6 py-4">
                <StatusBadge 
                  status={discount.status || (discount.discount && discount.discount > 0 ? 'active' : 'inactive')} 
                />
              </td>
              <td className="px-4 md:px-6 py-4 flex flex-wrap gap-2">
                <button
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded shadow text-xs font-bold hover:bg-blue-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => openEditModal(discount)}
                  disabled={rowLoading[discount.id]}
                  tabIndex={0}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-100 text-red-700 rounded shadow text-xs font-bold hover:bg-red-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  onClick={() => openConfirm('delete', discount)}
                  disabled={rowLoading[discount.id]}
                  tabIndex={0}
                >
                  {rowLoading[discount.id] && <Spinner size={16} color="border-red-700" />}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <ConfirmModal
        open={confirm.open}
        title={confirm.type.charAt(0).toUpperCase() + confirm.type.slice(1) + ' Confirmation'}
        message={confirmMessage[confirm.type]}
        onConfirm={() => handleAction(confirm.type, confirm.discount)}
        onCancel={closeConfirm}
        loading={rowLoading[confirm.discount?.id]}
      />
      
      <EditProductDiscountModal
        open={editModal.open}
        discount={editModal.discount}
        onClose={closeEditModal}
        onSuccess={() => {
          closeEditModal();
          onAction?.();
        }}
      />
    </div>
  );
} 