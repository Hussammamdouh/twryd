import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const useSupplierTranslation = () => {
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        const translationFile = await import(`../translations/supplier/${currentLanguage}.json`);
        setTranslations(translationFile.default || translationFile);
      } catch (error) {
        console.error('Failed to load supplier translations:', error);
        // Fallback to English if the current language file doesn't exist
        try {
          const fallbackFile = await import('../translations/supplier/en.json');
          setTranslations(fallbackFile.default || fallbackFile);
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
          setTranslations({});
        }
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const t = (key, params = {}) => {
    if (loading) return key;
    
    // Split the key by dots to access nested properties
    const keys = key.split('.');
    let translation = translations;
    
    for (const k of keys) {
      translation = translation?.[k];
      if (translation === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    // Replace parameters in translation
    if (typeof translation === 'string') {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }
    
    return translation || key;
  };

  return { t, loading, currentLanguage };
}; 