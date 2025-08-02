import React, { useEffect, useState } from 'react';
import { get } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Governates() {
  const { token } = useAuth();
  const [governates, setGovernates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const { t } = useLanguage();

  // Fetch governates
  const fetchGovernates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get('/api/v1/location/governorates', { token, params: { per_page: 50 } });
      setGovernates(res.data?.data || []);
    } catch (err) {
      setError(err.message || t('messages.failed_to_load'));
      toast.show(err.message || t('messages.failed_to_load'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchGovernates();
  }, [token]);

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-2 md:px-0">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <span className="text-gray-900 dark:text-white">{t('governorates.title')}</span>
            <span className="text-gray-500 dark:text-gray-400 font-normal text-lg sm:text-xl ml-2">{t('governorates.view')}</span>
          </div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('governorates.subtitle')}</p>
      </div>

        {/* Governorates List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('governorates.all_governorates')}</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('governorates.count', { 
                count: governates.length, 
                plural: governates.length !== 1 ? 's' : '' 
              })}
            </div>
            </div>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col items-center py-8">
                <svg className="animate-spin h-6 w-6 text-primary-500 mb-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{t('governorates.loading')}</span>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm text-center py-4">{error}</div>
            ) : governates.length === 0 ? (
              <div className="text-center py-8">
                <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('governorates.no_governorates')}</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {governates.map(g => (
                <div
                    key={g.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                      </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{g.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('governorates.id')}: {g.id}</p>
                    </div>
          </div>
        </div>
              ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
} 