import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import $api from '@/api/axiosInstance';
import { USER_ROLES } from '@/config/permissions';

// --- ZOD SCHEMA PRO VALIDACI ---
const schema = z.object({
  email: z.email('Zadejte platný email.'),
  password: z.string().min(1, 'Zadejte heslo.'),
});

/**
 * Hook pro správu přihlašovacího formuláře a autentizačního toku.
 */
export const useLogin = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role_id === USER_ROLES.DRIVER) {
        navigate('/driver', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');

    try {
      const res = await $api.post('/auth/login', data);
      const { accessToken } = res.data;
      await login(accessToken);
    } catch (err) {
      console.error(err);
      setServerError('Nesprávný email nebo heslo.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data: {
      isLoading,
      errors,
      register,
      serverError,
    },
    actions: {
      handleSubmit,
      onSubmit,
    },
  };
};
