import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { get, post, put, del } from '../../utils/api';
import PlansTable from '../../UI/admin/PlansTable';
import PlanFormModal from '../../UI/admin/PlanFormModal';
import Pagination from '../../UI/supplier/Pagination';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import { useLayout } from '../../hooks/useLayout';

export default function PlansManagement() {
  const { token } = useAuth();
  const toast = useToast();
  const { sidebarCollapsed } = useLayout();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, standard, custom
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [actionResult, setActionResult] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  // Fetch plans
  const fetchPlans = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await get(`/api/admin/plans?page=${pageNum}&per_page=10`, { token });
      const data = res.data?.plans?.data || res.data?.plans || res.data || [];
      setPlans(data);
      setTotalPages(res.data?.plans?.last_page || 1);
    } catch (err) {
      console.error('Failed to load plans:', err.message);
      toast.show(err.message || 'Failed to load plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPlans(page);
  }, [token, page]);

  // Filter plans
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      const matchesSearch = !search || 
        plan.name?.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
        (filter === 'standard' && !plan.is_custom) ||
        (filter === 'custom' && plan.is_custom);
      
      return matchesSearch && matchesFilter;
    });
  }, [plans, search, filter]);

  // Handle add plan
  const handleAdd = () => {
    setEditPlan(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  // Handle edit plan
  const handleEdit = (plan) => {
    setEditPlan(plan);
    setIsEdit(true);
    setModalOpen(true);
  };

  // Handle delete plan
  const handleDelete = async (plan) => {
    setRowLoading(l => ({ ...l, [plan.id]: true }));
    try {
      await del(`/api/admin/plans/${plan.id}`, { token });
      setRecentlyUpdated(prev => ({ ...prev, [plan.id]: true }));
      setActionResult(prev => ({ ...prev, [plan.id]: 'success' }));
      toast.show('Plan deleted successfully', 'success');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [plan.id]: false }));
        setActionResult(prev => ({ ...prev, [plan.id]: undefined }));
      }, 2000);
      fetchPlans(page);
    } catch (err) {
      setRecentlyUpdated(prev => ({ ...prev, [plan.id]: true }));
      setActionResult(prev => ({ ...prev, [plan.id]: 'error' }));
      toast.show(err.message || 'Failed to delete plan', 'error');
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [plan.id]: false }));
        setActionResult(prev => ({ ...prev, [plan.id]: undefined }));
      }, 2000);
    } finally {
      setRowLoading(l => ({ ...l, [plan.id]: false }));
    }
  };

  // Handle form submit
  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await put(`/api/admin/plans/${editPlan.id}`, {
          data: formData,
          token,
        });
        toast.show('Plan updated successfully', 'success');
      } else {
        await post('/api/admin/plans', {
          data: formData,
          token,
        });
        toast.show('Plan created successfully', 'success');
      }
      setModalOpen(false);
      fetchPlans(page);
    } catch (err) {
      toast.show(err.message || `Failed to ${isEdit ? 'update' : 'create'} plan`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  return (
    <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-text mb-2">Plans Management</h1>
            <p className="text-theme-text-secondary">Manage subscription plans for suppliers</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder="Search plans..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="theme-input w-full"
                  />
                </div>
                
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="theme-input min-w-[150px]"
                >
                  <option value="all">All Plans</option>
                  <option value="standard">Standard Plans</option>
                  <option value="custom">Custom Plans</option>
                </select>
              </div>
              
              {/* Add Button */}
              <button
                onClick={handleAdd}
                className="theme-button px-6 py-2 font-bold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                title="Add New Plan"
              >
                <span className="inline-block align-middle mr-2">+</span> Add Plan
              </button>
            </div>
          </div>

          {/* Plans Table */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <PlansTable
              plans={filteredPlans}
              onEdit={handleEdit}
              onDelete={handleDelete}
              recentlyUpdated={recentlyUpdated}
              actionResult={actionResult}
              rowLoading={rowLoading}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}

      {/* Plan Form Modal */}
      <PlanFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editPlan}
        isEdit={isEdit}
      />
    </div>
  );
} 