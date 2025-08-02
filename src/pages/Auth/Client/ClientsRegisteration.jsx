import React, { useState, useEffect } from 'react';
import { post } from '../../../utils/api';
import FileUpload from '../../../UI/Common/FileUpload';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function ClientsRegisteration() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    passwordConfirm: '',
    tax_card_number: '',
    tax_card_file: null,
    cr_number: '',
    cr_file: null,
    latitude: '',
    longitude: '',
    areaId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6),
          }));
        },
        (error) => {
          console.log('Location access denied or error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    if (form.password !== form.passwordConfirm) {
      setError(t('client_auth.passwords_not_match'));
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      // Add required fields with correct keys as per API
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('whatsapp', form.whatsapp);
      formData.append('password', form.password);
      formData.append('password_confirmation', form.passwordConfirm);
      formData.append('tax_card_number', form.tax_card_number);
      if (form.tax_card_file) formData.append('tax_card_file', form.tax_card_file);
      formData.append('cr_number', form.cr_number);
      if (form.cr_file) formData.append('cr_file', form.cr_file);
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      formData.append('area_id', form.areaId);
      
      const response = await post('/api/client/register', { data: formData });
      if (!response.success) {
        throw new Error(response.message || t('client_auth.register_failed'));
      }
      setSuccess(true);
      setTimeout(() => {
        const identifier = form.email || form.phone;
        window.location.href = `/verify-client${identifier ? `?identifier=${encodeURIComponent(identifier)}` : ''}`;
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg px-2 py-8" role="main">
      <div className="theme-card w-full max-w-lg p-8 sm:p-10 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 tracking-tight text-theme-text">
          {t('client_auth.register_title')}
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-8" />
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6" encType="multipart/form-data" aria-busy={loading}>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-base font-medium text-theme-text">{t('client_auth.client_name')}</label>
            <input type="text" name="name" id="name" required className="theme-input w-full px-4 py-3 rounded-md text-base" placeholder={t('client_auth.client_name_placeholder')} value={form.name} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-base font-medium text-theme-text">{t('client_auth.email')}</label>
            <input type="email" name="email" id="email" className="theme-input w-full px-4 py-3 rounded-md text-base" placeholder={t('client_auth.email_placeholder')} value={form.email} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-base font-medium text-theme-text">{t('client_auth.phone')}</label>
            <input type="tel" name="phone" id="phone" className="theme-input w-full px-4 py-3 rounded-md text-base" placeholder={t('client_auth.phone_placeholder')} value={form.phone} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="whatsapp" className="text-base font-medium text-theme-text">{t('client_auth.whatsapp')}</label>
            <input type="tel" name="whatsapp" id="whatsapp" className="theme-input w-full px-4 py-3 rounded-md text-base" placeholder={t('client_auth.whatsapp_placeholder')} value={form.whatsapp} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="password" className="text-base font-medium text-theme-text">{t('client_auth.password')}</label>
              <input type="password" name="password" id="password" required className="theme-input w-full px-4 py-3 rounded-md text-base" placeholder={t('client_auth.password_placeholder')} value={form.password} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="passwordConfirm" className="text-base font-medium text-theme-text">{t('client_auth.confirm_password')}</label>
              <input type="password" name="passwordConfirm" id="passwordConfirm" required className="theme-input w-full px-4 py-3 rounded-md text-base" placeholder={t('client_auth.confirm_password_placeholder')} value={form.passwordConfirm} onChange={handleChange} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="tax_card_number" className="text-base font-medium text-theme-text">{t('client_auth.tax_card_number')}</label>
            <input type="text" name="tax_card_number" id="tax_card_number" required className="theme-input w-full px-4 py-3 rounded-md text-base" placeholder={t('client_auth.tax_card_number_placeholder')} value={form.tax_card_number} onChange={handleChange} />
          </div>
          <FileUpload
            id="tax_card_file"
            name="tax_card_file"
            accept="image/*"
            required
            onChange={handleChange}
            label={t('client_auth.tax_card_file')}
            maxSize={2 * 1024 * 1024} // 2MB
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="cr_number" className="text-base font-medium text-theme-text">{t('client_auth.cr_number')}</label>
            <input type="text" name="cr_number" id="cr_number" required className="theme-input w-full px-4 py-3 rounded-md text-base" placeholder={t('client_auth.cr_number_placeholder')} value={form.cr_number} onChange={handleChange} />
          </div>
          <FileUpload
            id="cr_file"
            name="cr_file"
            accept="image/*"
            required
            onChange={handleChange}
            label={t('client_auth.cr_file')}
            maxSize={2 * 1024 * 1024} // 2MB
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="latitude" className="text-base font-medium text-theme-text">{t('client_auth.latitude')}</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  name="latitude" 
                  id="latitude" 
                  className="theme-input flex-1 px-4 py-3 rounded-md text-base" 
                  placeholder={t('client_auth.latitude_placeholder')} 
                  value={form.latitude} 
                  onChange={handleChange} 
                />
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setForm((prev) => ({
                            ...prev,
                            latitude: pos.coords.latitude.toFixed(6),
                            longitude: pos.coords.longitude.toFixed(6),
                          }));
                        },
                        (error) => {
                          console.log('Location access denied or error:', error.message);
                        },
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
                      );
                    }
                  }}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  title={t('client_auth.get_location')}
                >
                  📍
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="longitude" className="text-base font-medium text-theme-text">{t('client_auth.longitude')}</label>
              <input 
                type="text" 
                name="longitude" 
                id="longitude" 
                className="theme-input w-full px-4 py-3 rounded-md text-base" 
                placeholder={t('client_auth.longitude_placeholder')} 
                value={form.longitude} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="areaId" className="text-base font-medium text-theme-text">{t('client_auth.area_id')}</label>
            <input type="text" name="areaId" id="areaId" required className="theme-input w-full px-4 py-3 rounded-md text-base" placeholder={t('client_auth.area_id_placeholder')} value={form.areaId} onChange={handleChange} />
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">{t('client_auth.register_successful')}</div>}
          <button
            type="submit"
            disabled={loading}
            aria-label={t('client_auth.register_button')}
            className="theme-button w-full py-3 font-bold rounded-lg shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-60 text-base mt-2 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
            {loading ? t('client_auth.registering') : t('client_auth.register_button')}
          </button>
        </form>
      </div>
    </div>
  );
} 