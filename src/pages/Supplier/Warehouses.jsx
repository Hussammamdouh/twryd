import React, { useState } from 'react';
import Modal from '../../UI/Common/Modal';

const DUMMY_WAREHOUSES = [
  { id: 1, name: 'Main Warehouse', address: '123 Main St', region: 'Cairo', capacity: 500, is_active: true },
  { id: 2, name: 'Alex Storage', address: '45 Nile Ave', region: 'Alexandria', capacity: 300, is_active: false },
];

function WarehouseFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(
    initialData || { name: '', address: '', region: '', capacity: '', is_active: true }
  );
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open) setForm(initialData || { name: '', address: '', region: '', capacity: '', is_active: true });
  }, [open, initialData]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onSubmit(form);
      setLoading(false);
    }, 500);
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit Warehouse' : 'Add Warehouse'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        <input name="address" value={form.address} onChange={handleChange} required placeholder="Address" className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        <input name="region" value={form.region} onChange={handleChange} required placeholder="Region" className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        <input name="capacity" type="number" min="0" value={form.capacity} onChange={handleChange} required placeholder="Capacity" className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400" />
        <label className="flex items-center gap-2 mt-2">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
          <span>Active</span>
        </label>
        <button type="submit" disabled={loading} className="w-full py-2 font-bold text-white rounded bg-blue-500 hover:bg-blue-600 transition disabled:opacity-60 mt-2">
          {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Warehouse')}
        </button>
      </form>
    </Modal>
  );
}

function ConfirmDeleteModal({ open, onClose, onConfirm, warehouseName, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Warehouse">
      <h3 className="text-xl font-bold mb-4">Delete Warehouse</h3>
      <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{warehouseName}</span>?</p>
      <div className="flex gap-4 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState(DUMMY_WAREHOUSES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAdd = () => { setEditData(null); setModalOpen(true); };
  const handleEdit = (wh) => { setEditData(wh); setModalOpen(true); };
  const handleDelete = (wh) => { setDeleteTarget(wh); setDeleteModalOpen(true); };

  const handleSubmit = (form) => {
    if (editData) {
      setWarehouses(ws => ws.map(w => w.id === editData.id ? { ...w, ...form } : w));
    } else {
      setWarehouses(ws => [...ws, { ...form, id: Date.now() }]);
    }
    setModalOpen(false);
    setEditData(null);
  };

  const handleConfirmDelete = () => {
    setDeleteLoading(true);
    setTimeout(() => {
      setWarehouses(ws => ws.filter(w => w.id !== deleteTarget.id));
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      setDeleteLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-2">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Warehouses</h1>
        <button onClick={handleAdd} className="px-5 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700">+ Add Warehouse</button>
      </div>
      <div className="bg-white rounded-2xl shadow-2xl p-3 sm:p-6 border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-50 text-blue-700">
              <th className="py-2 px-3 text-left">Name</th>
              <th className="py-2 px-3 text-left">Address</th>
              <th className="py-2 px-3 text-left">Region</th>
              <th className="py-2 px-3 text-left">Capacity</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map(wh => (
              <tr key={wh.id} className="border-b last:border-b-0 hover:bg-blue-50/30">
                <td className="py-2 px-3 font-semibold">{wh.name}</td>
                <td className="py-2 px-3">{wh.address}</td>
                <td className="py-2 px-3">{wh.region}</td>
                <td className="py-2 px-3">{wh.capacity}</td>
                <td className="py-2 px-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${wh.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {wh.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2 px-3 text-right">
                  <button onClick={() => handleEdit(wh)} className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => handleDelete(wh)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {warehouses.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">No warehouses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <WarehouseFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialData={editData} />
      <ConfirmDeleteModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} warehouseName={deleteTarget?.name} loading={deleteLoading} />
    </div>
  );
} 