import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { post } from '../../../utils/api';

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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name.startsWith('key_persons')) {
      const [_, idx, field] = name.match(/key_persons\[(\d+)\]\[(\w+)\]/);
      setForm((prev) => {
        const kp = [...prev.key_persons];
        kp[Number(idx)][field] = value;
        return { ...prev, key_persons: kp };
      });
    } else if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const response = await post('/api/supplier/register', { data: formData });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed');
      }
      toast.success('Supplier registered successfully!');
      // Optionally redirect
      // setTimeout(() => window.location.href = '/login-supplier', 1500);
    } catch (err) {
      toast.error(err.message);
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
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6" encType="multipart/form-data" aria-busy={loading}>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="name" className="text-base font-medium text-gray-700">Name</label>
              <input id="name" name="name" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Supplier name" value={form.name} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="email" className="text-base font-medium text-gray-700">Email</label>
              <input id="email" name="email" type="email" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Supplier email" value={form.email} onChange={handleChange} />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="phone" className="text-base font-medium text-gray-700">Phone</label>
              <input id="phone" name="phone" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Supplier phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="whatsapp" className="text-base font-medium text-gray-700">WhatsApp</label>
              <input id="whatsapp" name="whatsapp" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Supplier WhatsApp" value={form.whatsapp} onChange={handleChange} />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="password" className="text-base font-medium text-gray-700">Password</label>
              <input id="password" name="password" type="password" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Password" value={form.password} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="password_confirmation" className="text-base font-medium text-gray-700">Confirm Password</label>
              <input id="password_confirmation" name="password_confirmation" type="password" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Confirm password" value={form.password_confirmation} onChange={handleChange} />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="tax_card_number" className="text-base font-medium text-gray-700">Tax Card Number</label>
              <input id="tax_card_number" name="tax_card_number" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Tax card number" value={form.tax_card_number} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="cr_number" className="text-base font-medium text-gray-700">CR Number</label>
              <input id="cr_number" name="cr_number" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="CR number" value={form.cr_number} onChange={handleChange} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="category_id" className="text-base font-medium text-gray-700">Category ID</label>
            <input id="category_id" name="category_id" required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Category ID" value={form.category_id} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-gray-700">Key Persons</label>
            {[0,1].map(i => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 mb-2">
                <input name={`key_persons[${i}][name]`} required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Name" value={form.key_persons[i].name} onChange={handleChange} />
                <input name={`key_persons[${i}][role]`} required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Role" value={form.key_persons[i].role} onChange={handleChange} />
                <input name={`key_persons[${i}][phone]`} required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Phone" value={form.key_persons[i].phone} onChange={handleChange} />
                <input name={`key_persons[${i}][email]`} required className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400" placeholder="Email" value={form.key_persons[i].email} onChange={handleChange} />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="logo" className="text-base font-medium text-gray-700">Logo</label>
            <input id="logo" name="logo" type="file" accept="image/*" required className="w-full bg-[#f7fafc] px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base" onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="tax_card_file" className="text-base font-medium text-gray-700">Tax Card File</label>
            <input id="tax_card_file" name="tax_card_file" type="file" accept="application/pdf,image/*" required className="w-full bg-[#f7fafc] px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base" onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="cr_file" className="text-base font-medium text-gray-700">CR File</label>
            <input id="cr_file" name="cr_file" type="file" accept="application/pdf,image/*" required className="w-full bg-[#f7fafc] px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base" onChange={handleChange} />
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