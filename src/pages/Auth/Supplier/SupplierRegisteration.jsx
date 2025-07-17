import React, { useState, useEffect } from 'react';
import { post, get } from '../../../utils/api';
import { useToast } from '../../UI/Common/ToastContext';

const KEY_PERSON_ROLES = [
  { value: '', label: 'Select Role' },
  { value: 'Management', label: 'Management' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Owner', label: 'Owner' },
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^01[0-9]{9}$|^\+?[0-9]{10,15}$/; // Egyptian or international

export default function SupplierRegisteration() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    password_confirmation: '',
    tax_card_number: '',
    cr_number: '',
    category_id: '',
    key_persons: [
      { name: '', role: '', phone: '', email: '' },
      { name: '', role: '', phone: '', email: '' },
    ],
    logo: null,
    tax_card_file: null,
    cr_file: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const toast = useToast();

  useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true);
      setCategoriesError('');
      try {
        const res = await get('/api/v1/categories');
        const cats = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCategories(cats);
      } catch {
        setCategories([]);
        setCategoriesError('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // --- Validation helpers ---
  function validateField(name, value, files) {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required.';
        if (!EMAIL_REGEX.test(value)) return 'Invalid email format.';
        return '';
      case 'phone':
      case 'whatsapp':
        if (!value) return 'Phone is required.';
        if (!PHONE_REGEX.test(value)) return 'Invalid phone number.';
        return '';
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        return '';
      case 'password_confirmation':
        if (!value) return 'Please confirm your password.';
        if (value !== form.password) return 'Passwords do not match.';
        return '';
      case 'logo':
      case 'tax_card_file':
      case 'cr_file': {
        const file = files ? files[0] : form[name];
        if (!file) return 'This file is required.';
        if (name === 'logo' && file && !file.type.startsWith('image/')) return 'Logo must be an image.';
        if ((name === 'tax_card_file' || name === 'cr_file') && file && !(file.type.startsWith('image/') || file.type === 'application/pdf')) return 'File must be an image or PDF.';
        if (file && file.size > MAX_FILE_SIZE) return 'File must be less than 2MB.';
        return '';
      }
      case 'category_id':
        if (!value) return 'Category is required.';
        return '';
      case 'tax_card_number':
        if (!value) return 'Tax card number is required.';
        return '';
      case 'cr_number':
        if (!value) return 'CR number is required.';
        return '';
      default:
        return '';
    }
  }

  function validateKeyPerson(idx, field, value) {
    if (!value) return 'Required.';
    if (field === 'email' && !EMAIL_REGEX.test(value)) return 'Invalid email.';
    if (field === 'phone' && !PHONE_REGEX.test(value)) return 'Invalid phone.';
    return '';
  }

  function validateAll() {
    const errors = {};
    errors.name = !form.name ? 'Name is required.' : '';
    errors.email = validateField('email', form.email);
    errors.phone = validateField('phone', form.phone);
    errors.whatsapp = validateField('whatsapp', form.whatsapp);
    errors.password = validateField('password', form.password);
    errors.password_confirmation = validateField('password_confirmation', form.password_confirmation);
    errors.tax_card_number = validateField('tax_card_number', form.tax_card_number);
    errors.cr_number = validateField('cr_number', form.cr_number);
    errors.category_id = validateField('category_id', form.category_id);
    errors.logo = validateField('logo', form.logo ? form.logo : null);
    errors.tax_card_file = validateField('tax_card_file', form.tax_card_file ? form.tax_card_file : null);
    errors.cr_file = validateField('cr_file', form.cr_file ? form.cr_file : null);
    errors.key_persons = form.key_persons.map((kp, i) => {
      return {
        name: !kp.name ? 'Required.' : '',
        role: !kp.role ? 'Required.' : '',
        phone: validateKeyPerson(i, 'phone', kp.phone),
        email: validateKeyPerson(i, 'email', kp.email),
      };
    });
    setFormErrors(errors);
    // Return true if no errors
    return !Object.values(errors).some(
      v => Array.isArray(v)
        ? v.some(obj => Object.values(obj).some(Boolean))
        : Boolean(v)
    );
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name.startsWith('key_persons')) {
      const [_, idx, field] = name.match(/key_persons\[(\d+)\]\[(\w+)\]/);
      setForm((prev) => {
        const kp = [...prev.key_persons];
        kp[Number(idx)][field] = value;
        return { ...prev, key_persons: kp };
      });
      setFormErrors((prev) => {
        const kpErrs = prev.key_persons ? [...prev.key_persons] : [{}, {}];
        kpErrs[Number(idx)][field] = validateKeyPerson(Number(idx), field, value);
        return { ...prev, key_persons: kpErrs };
      });
    } else if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      setFormErrors((prev) => ({ ...prev, [name]: validateField(name, '', files) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.show('Please fix the errors in the form.', 'error');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('whatsapp', form.whatsapp);
      formData.append('password', form.password);
      formData.append('password_confirmation', form.password_confirmation);
      formData.append('tax_card_number', form.tax_card_number);
      formData.append('cr_number', form.cr_number);
      formData.append('category_ids[0]', form.category_id);
      form.key_persons.forEach((kp, i) => {
        formData.append(`key_persons[${i}][name]`, kp.name);
        formData.append(`key_persons[${i}][role]`, kp.role);
        formData.append(`key_persons[${i}][phone]`, kp.phone);
        formData.append(`key_persons[${i}][email]`, kp.email);
      });
      if (form.logo) formData.append('logo', form.logo);
      if (form.tax_card_file) formData.append('tax_card_file', form.tax_card_file);
      if (form.cr_file) formData.append('cr_file', form.cr_file);
      await post('/api/supplier/register', { data: formData });
      toast.show('Supplier registered successfully!', 'success');
      // Optionally redirect
      // setTimeout(() => window.location.href = '/login-supplier', 1500);
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ef] to-[#f5f5f5] px-2 py-8" role="main">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 sm:p-10 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 tracking-tight text-gray-900">
          Supplier Registration
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-[#0099FF] to-[#1E90FF] rounded-full mb-8" />
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6" encType="multipart/form-data" aria-busy={loading} noValidate>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="name" className="text-base font-medium text-gray-700">Name</label>
              <input id="name" name="name" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Supplier name" value={form.name} onChange={handleChange} aria-invalid={!!formErrors.name} aria-describedby={formErrors.name ? 'name-error' : undefined} />
              {formErrors.name && <div id="name-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.name}</div>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="email" className="text-base font-medium text-gray-700">Email</label>
              <input id="email" name="email" type="email" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Supplier email" value={form.email} onChange={handleChange} aria-invalid={!!formErrors.email} aria-describedby={formErrors.email ? 'email-error' : undefined} />
              {formErrors.email && <div id="email-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.email}</div>}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="phone" className="text-base font-medium text-gray-700">Phone</label>
              <input id="phone" name="phone" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Supplier phone" value={form.phone} onChange={handleChange} aria-invalid={!!formErrors.phone} aria-describedby={formErrors.phone ? 'phone-error' : undefined} />
              {formErrors.phone && <div id="phone-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.phone}</div>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="whatsapp" className="text-base font-medium text-gray-700">WhatsApp</label>
              <input id="whatsapp" name="whatsapp" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Supplier WhatsApp" value={form.whatsapp} onChange={handleChange} aria-invalid={!!formErrors.whatsapp} aria-describedby={formErrors.whatsapp ? 'whatsapp-error' : undefined} />
              {formErrors.whatsapp && <div id="whatsapp-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.whatsapp}</div>}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="password" className="text-base font-medium text-gray-700">Password</label>
              <input id="password" name="password" type="password" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Password" value={form.password} onChange={handleChange} aria-invalid={!!formErrors.password} aria-describedby={formErrors.password ? 'password-error' : undefined} />
              {formErrors.password && <div id="password-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.password}</div>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="password_confirmation" className="text-base font-medium text-gray-700">Confirm Password</label>
              <input id="password_confirmation" name="password_confirmation" type="password" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Confirm password" value={form.password_confirmation} onChange={handleChange} aria-invalid={!!formErrors.password_confirmation} aria-describedby={formErrors.password_confirmation ? 'password_confirmation-error' : undefined} />
              {formErrors.password_confirmation && <div id="password_confirmation-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.password_confirmation}</div>}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="tax_card_number" className="text-base font-medium text-gray-700">Tax Card Number</label>
              <input id="tax_card_number" name="tax_card_number" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Tax card number" value={form.tax_card_number} onChange={handleChange} aria-invalid={!!formErrors.tax_card_number} aria-describedby={formErrors.tax_card_number ? 'tax_card_number-error' : undefined} />
              {formErrors.tax_card_number && <div id="tax_card_number-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.tax_card_number}</div>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="cr_number" className="text-base font-medium text-gray-700">CR Number</label>
              <input id="cr_number" name="cr_number" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="CR number" value={form.cr_number} onChange={handleChange} aria-invalid={!!formErrors.cr_number} aria-describedby={formErrors.cr_number ? 'cr_number-error' : undefined} />
              {formErrors.cr_number && <div id="cr_number-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.cr_number}</div>}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="category_id" className="text-base font-medium text-gray-700">Category</label>
            <select
              id="category_id"
              name="category_id"
              required
              className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
              value={form.category_id}
              onChange={handleChange}
              aria-invalid={!!formErrors.category_id}
              aria-describedby={formErrors.category_id ? 'category_id-error' : undefined}
              disabled={categoriesLoading || !!categoriesError}
            >
              {categoriesLoading ? (
                <option value="">Loading categories...</option>
              ) : categoriesError ? (
                <option value="">{categoriesError}</option>
              ) : (
                <>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </>
              )}
            </select>
            {formErrors.category_id && <div id="category_id-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.category_id}</div>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-gray-700">Key Persons</label>
            {[0,1].map(i => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 mb-2">
                <input name={`key_persons[${i}][name]`} required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Name" value={form.key_persons[i].name} onChange={handleChange} aria-invalid={!!formErrors.key_persons[i].name} aria-describedby={formErrors.key_persons[i].name ? `key_persons-${i}-name-error` : undefined} />
                <select
                  name={`key_persons[${i}][role]`}
                  required
                  className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                  value={form.key_persons[i].role}
                  onChange={handleChange}
                >
                  {KEY_PERSON_ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <input name={`key_persons[${i}][phone]`} required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Phone" value={form.key_persons[i].phone} onChange={handleChange} aria-invalid={!!formErrors.key_persons[i].phone} aria-describedby={formErrors.key_persons[i].phone ? `key_persons-${i}-phone-error` : undefined} />
                <input name={`key_persons[${i}][email]`} required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Email" value={form.key_persons[i].email} onChange={handleChange} aria-invalid={!!formErrors.key_persons[i].email} aria-describedby={formErrors.key_persons[i].email ? `key_persons-${i}-email-error` : undefined} />
              </div>
            ))}
            {formErrors.key_persons && formErrors.key_persons.map((err, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 mb-2">
                <div className="w-full text-red-500 text-xs mt-1" id={`key_persons-${i}-name-error`} role="alert">{err.name}</div>
                <div className="w-full text-red-500 text-xs mt-1" id={`key_persons-${i}-role-error`} role="alert">{err.role}</div>
                <div className="w-full text-red-500 text-xs mt-1" id={`key_persons-${i}-phone-error`} role="alert">{err.phone}</div>
                <div className="w-full text-red-500 text-xs mt-1" id={`key_persons-${i}-email-error`} role="alert">{err.email}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="logo" className="text-base font-medium text-gray-700">Logo</label>
            <input id="logo" name="logo" type="file" accept="image/*" required className="w-full bg-[#f7fafc] px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base" onChange={handleChange} aria-invalid={!!formErrors.logo} aria-describedby={formErrors.logo ? 'logo-error' : undefined} />
            {formErrors.logo && <div id="logo-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.logo}</div>}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="tax_card_file" className="text-base font-medium text-gray-700">Tax Card File</label>
            <input id="tax_card_file" name="tax_card_file" type="file" accept="application/pdf,image/*" required className="w-full bg-[#f7fafc] px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base" onChange={handleChange} aria-invalid={!!formErrors.tax_card_file} aria-describedby={formErrors.tax_card_file ? 'tax_card_file-error' : undefined} />
            {formErrors.tax_card_file && <div id="tax_card_file-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.tax_card_file}</div>}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="cr_file" className="text-base font-medium text-gray-700">CR File</label>
            <input id="cr_file" name="cr_file" type="file" accept="application/pdf,image/*" required className="w-full bg-[#f7fafc] px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base" onChange={handleChange} aria-invalid={!!formErrors.cr_file} aria-describedby={formErrors.cr_file ? 'cr_file-error' : undefined} />
            {formErrors.cr_file && <div id="cr_file-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.cr_file}</div>}
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-label="Register"
            className="w-full py-3 font-bold text-white rounded-lg bg-gradient-to-r from-[#0099FF] to-[#1E90FF] shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-60 text-base mt-2 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" aria-hidden="true"></path>
              </svg>
            )}
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
} 