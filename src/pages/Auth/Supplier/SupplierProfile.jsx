import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { get, put } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../UI/Common/ToastContext';
import { useSupplierTranslation } from '../../../hooks/useSupplierTranslation';

export default function SupplierProfile() {
  const { user: authUser, token } = useAuth();
  const toast = useToast();
  const { t } = useSupplierTranslation();
  
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
  const [categories, setCategories] = useState([]);

  // Fetch user profile data
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchCategories();
    }
  }, [token]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await get('/api/v1/categories');
      const cats = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

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
      toast.show(error.message || t('profile.failed_to_fetch_profile'), 'error');
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
      newErrors.name = t('profile.name_required');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('profile.email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('profile.invalid_email');
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t('profile.phone_required');
    }
    
    if (!formData.tax_card_number.trim()) {
      newErrors.tax_card_number = t('profile.tax_card_required');
    }
    
    if (!formData.cr_number.trim()) {
      newErrors.cr_number = t('profile.cr_number_required');
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
        toast.show(t('profile.profile_updated_successfully'), 'success');
      }
    } catch (error) {
      toast.show(error.message || t('profile.failed_to_update_profile'), 'error');
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
          toast.show(t('profile.failed_to_get_location', { error: error.message }), 'error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      toast.show(t('profile.geolocation_not_supported'), 'error');
    }
  };

  // Authentication checks
  if (!token || !authUser) {
    return <Navigate to="/login-supplier" replace />;
  }

  if (authUser.role !== 'supplier') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg py-12 px-4">
        <div className="theme-card p-6 sm:p-8 max-w-md text-center w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-theme-text">{t('profile.access_denied')}</h2>
          <p className="text-theme-text-secondary">{t('profile.access_denied_message')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg px-4">
        <div className="theme-card p-6 sm:p-8 text-center w-full max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-theme-text-secondary">{t('profile.loading_profile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="theme-card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-theme-text">{t('profile.title')}</h1>
              <p className="text-theme-text-secondary mt-1">{t('profile.subtitle')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="theme-button px-4 sm:px-6 py-2 font-medium w-full sm:w-auto"
                >
                  {t('profile.edit_profile')}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCancel}
                    className="px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium w-full sm:w-auto"
                  >
                    {t('profile.cancel')}
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    {updating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {updating ? t('profile.saving') : t('profile.save_changes')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Personal Information */}
          <div className="theme-card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-theme-text mb-4 sm:mb-6">{t('profile.personal_information')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  {t('profile.company_name')} *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    placeholder={t('profile.company_name_placeholder')}
                  />
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface rounded-lg text-theme-text text-sm sm:text-base">
                    {user?.name || t('profile.not_provided')}
                  </div>
                )}
                {errors.name && <p className="text-red-500 text-sm mt-1">{t('profile.name_required')}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  {t('profile.email_address')} *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    placeholder={t('profile.email_address_placeholder')}
                  />
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface rounded-lg text-theme-text text-sm sm:text-base">
                    {user?.email || t('profile.not_provided')}
                  </div>
                )}
                {errors.email && <p className="text-red-500 text-sm mt-1">{t('profile.email_required')}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  {t('profile.phone_number')} *
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
                      errors.phone ? 'border-red-500' : ''
                    }`}
                    placeholder={t('profile.phone_number_placeholder')}
                  />
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface rounded-lg text-theme-text text-sm sm:text-base">
                    {user?.phone || t('profile.not_provided')}
                  </div>
                )}
                {errors.phone && <p className="text-red-500 text-sm mt-1">{t('profile.phone_required')}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  {t('profile.whatsapp_number')}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    placeholder={t('profile.whatsapp_number_placeholder')}
                  />
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface rounded-lg text-theme-text text-sm sm:text-base">
                    {user?.whatsapp || t('profile.not_provided')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="theme-card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-theme-text mb-4 sm:mb-6">{t('profile.business_information')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  {t('profile.tax_card_number')} *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="tax_card_number"
                    value={formData.tax_card_number}
                    onChange={handleInputChange}
                    className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
                      errors.tax_card_number ? 'border-red-500' : ''
                    }`}
                    placeholder={t('profile.tax_card_number_placeholder')}
                  />
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface rounded-lg text-theme-text text-sm sm:text-base">
                    {user?.tax_card_number || t('profile.not_provided')}
                  </div>
                )}
                {errors.tax_card_number && <p className="text-red-500 text-sm mt-1">{t('profile.tax_card_required')}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  {t('profile.commercial_registration_number')} *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="cr_number"
                    value={formData.cr_number}
                    onChange={handleInputChange}
                    className={`theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
                      errors.cr_number ? 'border-red-500' : ''
                    }`}
                    placeholder={t('profile.commercial_registration_number_placeholder')}
                  />
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface rounded-lg text-theme-text text-sm sm:text-base">
                    {user?.cr_number || t('profile.not_provided')}
                  </div>
                )}
                {errors.cr_number && <p className="text-red-500 text-sm mt-1">{t('profile.cr_number_required')}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  {t('profile.area_id')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="area_id"
                    value={formData.area_id}
                    onChange={handleInputChange}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    placeholder={t('profile.area_id_placeholder')}
                  />
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface rounded-lg text-theme-text text-sm sm:text-base">
                    {user?.area_id || t('profile.not_provided')}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  {t('profile.business_categories_label')}
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category.id} className="flex items-center gap-3 p-3 bg-theme-surface rounded-lg hover:bg-theme-surface/80 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.category_ids.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                category_ids: [...prev.category_ids, category.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                category_ids: prev.category_ids.filter(id => id !== category.id)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-primary-600 bg-theme-surface border-theme-border rounded focus:ring-primary-500 focus:ring-2"
                        />
                        <div>
                          <div className="font-medium text-theme-text text-sm">{category.name}</div>
                          {category.description && (
                            <div className="text-xs text-theme-text-secondary">{category.description}</div>
                          )}
                        </div>
                      </label>
                    ))}
                                          {categories.length === 0 && (
                        <div className="text-sm text-theme-text-secondary p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          {t('profile.no_categories_available')}
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface rounded-lg text-theme-text text-sm sm:text-base">
                    {user?.categories && user.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.categories.map((category, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded text-xs">
                            {category.name}
                          </span>
                        ))}
                      </div>
                    ) : t('profile.no_categories_assigned')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="theme-card p-4 sm:p-6 lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-bold text-theme-text mb-4 sm:mb-6">{t('profile.location_information')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  {t('profile.latitude')}
                </label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="theme-input flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                      placeholder={t('profile.latitude_placeholder')}
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                                              title={t('profile.get_current_location')}
                    >
                      📍
                    </button>
                  </div>
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface rounded-lg text-theme-text text-sm sm:text-base">
                    {user?.latitude || t('profile.not_provided')}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  {t('profile.longitude')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="theme-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    placeholder={t('profile.longitude_placeholder')}
                  />
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-theme-surface rounded-lg text-theme-text text-sm sm:text-base">
                    {user?.longitude || t('profile.not_provided')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="theme-card p-4 sm:p-6 lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-bold text-theme-text mb-4 sm:mb-6">{t('profile.account_status')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 sm:p-4 bg-theme-surface rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-theme-text">{user?.id || 'N/A'}</div>
                <div className="text-xs sm:text-sm text-theme-text-secondary">{t('profile.supplier_id')}</div>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-theme-surface rounded-lg">
                <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  user?.is_active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {user?.is_active ? 'Active' : 'Pending'}
                </div>
                <div className="text-xs sm:text-sm text-theme-text-secondary mt-1">{t('profile.status')}</div>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-theme-surface rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-theme-text">
                  {user?.email_verified_at ? '✓' : '✗'}
                </div>
                <div className="text-xs sm:text-sm text-theme-text-secondary">{t('profile.email_verified')}</div>
              </div>
            </div>
          </div>

          {/* Logo Section */}
          {user?.logo_url && (
            <div className="theme-card p-4 sm:p-6 lg:col-span-2">
              <h2 className="text-lg sm:text-xl font-bold text-theme-text mb-4 sm:mb-6">{t('profile.company_logo')}</h2>
              <div className="flex justify-center">
                <img 
                  src={user.logo_url} 
                  alt={t('profile.company_logo')} 
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-lg border border-theme-border"
                />
              </div>
            </div>
          )}

          {/* Categories Section */}
          {user?.categories && user.categories.length > 0 && (
            <div className="theme-card p-4 sm:p-6 lg:col-span-2">
              <h2 className="text-lg sm:text-xl font-bold text-theme-text mb-4 sm:mb-6">{t('profile.business_categories')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {user.categories.map((category, index) => (
                  <div key={index} className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-200 dark:border-primary-700">
                    <div className="font-medium text-primary-900 dark:text-primary-100 text-sm sm:text-base">{category.name}</div>
                    {category.description && (
                      <div className="text-xs sm:text-sm text-primary-700 dark:text-primary-300 mt-1">{category.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Persons Section */}
          {user?.key_persons && user.key_persons.length > 0 && (
            <div className="theme-card p-4 sm:p-6 lg:col-span-2">
              <h2 className="text-lg sm:text-xl font-bold text-theme-text mb-4 sm:mb-6">{t('profile.key_personnel')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.key_persons.map((person, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-theme-surface rounded-lg border border-theme-border">
                    <div className="font-medium text-theme-text mb-2 text-sm sm:text-base">{person.name}</div>
                    <div className="text-xs sm:text-sm text-theme-text-secondary space-y-1">
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
            <div className="theme-card p-4 sm:p-6 lg:col-span-2">
              <h2 className="text-lg sm:text-xl font-bold text-theme-text mb-4 sm:mb-6">{t('profile.business_documents')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user?.tax_card_file_url && (
                  <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-medium text-green-900 mb-2 text-sm sm:text-base">{t('profile.tax_card_document')}</div>
                    <a 
                      href={user.tax_card_file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 text-xs sm:text-sm underline"
                    >
                      {t('profile.view_document')}
                    </a>
                  </div>
                )}
                {user?.cr_file_url && (
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-900 mb-2 text-sm sm:text-base">{t('profile.commercial_registration_document')}</div>
                    <a 
                      href={user.cr_file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm underline"
                    >
                      {t('profile.view_document')}
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