import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { get, put } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../UI/Common/ToastContext';

export default function SupplierProfile() {
  const { user: authUser, logout, token } = useAuth();
  const toast = useToast();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    tax_card_number: '',
    cr_number: '',
    latitude: '',
    longitude: '',
    area_id: '',
    category_ids: [],
    key_persons: []
  });
  const [errors, setErrors] = useState({});

  // Fetch user profile data
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await get('/api/supplier/profile', { token });
      if (response.success && response.data) {
        const supplierData = response.data; // Note: supplier data is directly in response.data, not response.data.supplier
        setUser(supplierData);
        setFormData({
          name: supplierData.name || '',
          email: supplierData.email || '',
          phone: supplierData.phone || '',
          whatsapp: supplierData.whatsapp || '',
          tax_card_number: supplierData.tax_card_number || '',
          cr_number: supplierData.cr_number || '',
          latitude: supplierData.latitude || '',
          longitude: supplierData.longitude || '',
          area_id: supplierData.area_id || '',
          category_ids: supplierData.categories?.map(cat => cat.id) || [],
          key_persons: supplierData.key_persons || []
        });
        
        // Auto-get location if not provided
        if (!supplierData.latitude || !supplierData.longitude) {
          getCurrentLocation();
        }
      }
    } catch (error) {
      toast.show(error.message || 'Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.tax_card_number.trim()) {
      newErrors.tax_card_number = 'Tax card number is required';
    }
    
    if (!formData.cr_number.trim()) {
      newErrors.cr_number = 'Commercial registration number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setUpdating(true);
      const response = await put('/api/supplier/profile', {
        token,
        data: formData
      });
      
      if (response.success) {
        setUser(response.data); // Note: supplier data is directly in response.data
        setIsEditing(false);
        toast.show('Profile updated successfully!', 'success');
      }
    } catch (error) {
      toast.show(error.message || 'Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
        tax_card_number: user.tax_card_number || '',
        cr_number: user.cr_number || '',
        latitude: user.latitude || '',
        longitude: user.longitude || '',
        area_id: user.area_id || '',
        category_ids: user.categories?.map(cat => cat.id) || [],
        key_persons: user.key_persons || []
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
        },
        (error) => {
          toast.show('Failed to get location: ' + error.message, 'error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      toast.show('Geolocation is not supported by this browser', 'error');
    }
  };

  // Authentication checks
  if (!token || !authUser) {
    return <Navigate to="/login-supplier" replace />;
  }

  if (authUser.role !== 'supplier') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg py-12">
        <div className="theme-card p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-theme-text">Access Denied</h2>
          <p className="text-theme-text-secondary">This page is only available for supplier users.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg">
        <div className="theme-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-theme-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="theme-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-theme-text">Supplier Profile</h1>
              <p className="text-theme-text-secondary mt-1">Manage your account information</p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="theme-button px-6 py-2 font-medium"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {updating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
              <button
                onClick={logout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="theme-card p-6">
            <h2 className="text-xl font-bold text-theme-text mb-6">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Company Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`theme-input w-full px-4 py-3 rounded-lg ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter company name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-theme-surface rounded-lg text-theme-text">
                    {user?.name || 'Not provided'}
                  </div>
                )}
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Email Address *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`theme-input w-full px-4 py-3 rounded-lg ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter email address"
                  />
                ) : (
                  <div className="px-4 py-3 bg-theme-surface rounded-lg text-theme-text">
                    {user?.email || 'Not provided'}
                  </div>
                )}
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Phone Number *
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`theme-input w-full px-4 py-3 rounded-lg ${
                      errors.phone ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="px-4 py-3 bg-theme-surface rounded-lg text-theme-text">
                    {user?.phone || 'Not provided'}
                  </div>
                )}
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  WhatsApp Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="theme-input w-full px-4 py-3 rounded-lg"
                    placeholder="Enter WhatsApp number"
                  />
                ) : (
                  <div className="px-4 py-3 bg-theme-surface rounded-lg text-theme-text">
                    {user?.whatsapp || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="theme-card p-6">
            <h2 className="text-xl font-bold text-theme-text mb-6">Business Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Tax Card Number *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="tax_card_number"
                    value={formData.tax_card_number}
                    onChange={handleInputChange}
                    className={`theme-input w-full px-4 py-3 rounded-lg ${
                      errors.tax_card_number ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter tax card number"
                  />
                ) : (
                  <div className="px-4 py-3 bg-theme-surface rounded-lg text-theme-text">
                    {user?.tax_card_number || 'Not provided'}
                  </div>
                )}
                {errors.tax_card_number && <p className="text-red-500 text-sm mt-1">{errors.tax_card_number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Commercial Registration Number *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="cr_number"
                    value={formData.cr_number}
                    onChange={handleInputChange}
                    className={`theme-input w-full px-4 py-3 rounded-lg ${
                      errors.cr_number ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter CR number"
                  />
                ) : (
                  <div className="px-4 py-3 bg-theme-surface rounded-lg text-theme-text">
                    {user?.cr_number || 'Not provided'}
                  </div>
                )}
                {errors.cr_number && <p className="text-red-500 text-sm mt-1">{errors.cr_number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Area ID
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="area_id"
                    value={formData.area_id}
                    onChange={handleInputChange}
                    className="theme-input w-full px-4 py-3 rounded-lg"
                    placeholder="Enter area ID"
                  />
                ) : (
                  <div className="px-4 py-3 bg-theme-surface rounded-lg text-theme-text">
                    {user?.area_id || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="theme-card p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-theme-text mb-6">Location Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Latitude
                </label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="theme-input flex-1 px-4 py-3 rounded-lg"
                      placeholder="Latitude"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Get current location"
                    >
                      📍
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-theme-surface rounded-lg text-theme-text">
                    {user?.latitude || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Longitude
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="theme-input w-full px-4 py-3 rounded-lg"
                    placeholder="Longitude"
                  />
                ) : (
                  <div className="px-4 py-3 bg-theme-surface rounded-lg text-theme-text">
                    {user?.longitude || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="theme-card p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-theme-text mb-6">Account Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-theme-surface rounded-lg">
                <div className="text-2xl font-bold text-theme-text">{user?.id || 'N/A'}</div>
                <div className="text-sm text-theme-text-secondary">Supplier ID</div>
              </div>
              
              <div className="text-center p-4 bg-theme-surface rounded-lg">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user?.is_active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {user?.is_active ? 'Active' : 'Pending'}
                </div>
                <div className="text-sm text-theme-text-secondary mt-1">Status</div>
              </div>
              
              <div className="text-center p-4 bg-theme-surface rounded-lg">
                <div className="text-2xl font-bold text-theme-text">
                  {user?.email_verified_at ? '✓' : '✗'}
                </div>
                <div className="text-sm text-theme-text-secondary">Email Verified</div>
              </div>
            </div>
          </div>

          {/* Logo Section */}
          {user?.logo_url && (
            <div className="theme-card p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-theme-text mb-6">Company Logo</h2>
              <div className="flex justify-center">
                <img 
                  src={user.logo_url} 
                  alt="Company Logo" 
                  className="w-32 h-32 object-contain rounded-lg border border-theme-border"
                />
              </div>
            </div>
          )}

          {/* Categories Section */}
          {user?.categories && user.categories.length > 0 && (
            <div className="theme-card p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-theme-text mb-6">Business Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {user.categories.map((category, index) => (
                  <div key={index} className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-200 dark:border-primary-700">
                    <div className="font-medium text-primary-900 dark:text-primary-100">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-primary-700 dark:text-primary-300 mt-1">{category.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Persons Section */}
          {user?.key_persons && user.key_persons.length > 0 && (
            <div className="theme-card p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-theme-text mb-6">Key Personnel</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.key_persons.map((person, index) => (
                  <div key={index} className="p-4 bg-theme-surface rounded-lg border border-theme-border">
                    <div className="font-medium text-theme-text mb-2">{person.name}</div>
                    <div className="text-sm text-theme-text-secondary space-y-1">
                      <div><span className="font-medium">Role:</span> {person.role || person.type}</div>
                      <div><span className="font-medium">Phone:</span> {person.phone}</div>
                      <div><span className="font-medium">Email:</span> {person.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {(user?.tax_card_file_url || user?.cr_file_url) && (
            <div className="theme-card p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-theme-text mb-6">Business Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.tax_card_file_url && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-medium text-green-900 mb-2">Tax Card Document</div>
                    <a 
                      href={user.tax_card_file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 text-sm underline"
                    >
                      View Document
                    </a>
                  </div>
                )}
                {user?.cr_file_url && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-900 mb-2">Commercial Registration Document</div>
                    <a 
                      href={user.cr_file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 