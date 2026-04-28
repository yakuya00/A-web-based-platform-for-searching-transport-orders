import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import $api from '@/api/axiosInstance';

export const useLogin = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });

  const updateData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    if (errors.email || errors.password) {
      setErrors({ email: '', password: '' });
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role_id === 3 || user.role_name === 'driver') {
        navigate('/driver', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = { email: '', password: '' };
    let hasError = false;

    if (!formData.email.trim()) {
      newErrors.email = 'Zadejte Email';
      hasError = true;
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Zadejte heslo';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await $api.post('/auth/login', formData);
      const { accessToken } = res.data;
      await login(accessToken);
    } catch (err) {
      console.log(err);
      setErrors({
        email: ' ',
        password: 'Nesprávný email nebo heslo',
      });
    }
  };

  return {
    data: {
      formData,
      errors,
      updateData,
    },
    actions: {
      handleLogin,
    },
  };
};
