import React from 'react';
import Modal from '../Common/Modal';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} className="max-w-sm">
      <h2 className="text-lg font-bold mb-2 text-gray-900">{title}</h2>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold shadow flex items-center gap-2"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
          Confirm
        </button>
      </div>
    </Modal>
  );
} 