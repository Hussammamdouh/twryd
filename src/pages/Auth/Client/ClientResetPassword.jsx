import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { post } from '../../../utils/api';

const ClientResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post('/api/client/reset-password', { data: { email, password } });
      navigate('/login-client');
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit" disabled={loading}>Reset</button>
    </form>
  );
};
export default ClientResetPassword; 