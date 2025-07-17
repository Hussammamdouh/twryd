import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../../../utils/api';

const SupplierForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post('/api/supplier/forgot-password', { data: { email } });
      navigate('/reset-password-supplier', { state: { email } });
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button type="submit" disabled={loading}>Submit</button>
    </form>
  );
};
export default SupplierForgotPassword; 