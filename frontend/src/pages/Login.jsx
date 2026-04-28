import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import $api from '@/api/axiosInstance'; // Убедись, что путь правильный

// 🔥 1. Простая схема валидации для логина
const schema = z.object({
  email: z.email('Zadejte platný email.'),
  password: z.string().min(1, 'Zadejte heslo.'),
});

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // 🔥 2. Подключаем Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  // 🔥 3. Логика редиректа после успешного входа (из твоего старого кода)
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role_id === 3 || user.role_name === 'driver') {
        navigate('/driver', { replace: true });
      } else {
        navigate('/freights/search', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // 🔥 4. Функция отправки
  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');

    try {
      const res = await $api.post('/auth/login', data);
      const { accessToken } = res.data;

      // Передаем токен в контекст (он сам скачает профиль и изменит isAuthenticated)
      await login(accessToken);
    } catch (err) {
      console.error(err);
      // Если сервер ответил ошибкой (например, 401 Unauthorized)
      setServerError('Nesprávný email nebo heslo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-surface p-8 rounded-xl w-full max-w-sm flex flex-col gap-5 shadow-lg border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-center text-secondary mb-2">
          Přihlášení
        </h2>

        {/* Плашка с ошибкой от сервера (если неверный пароль) */}
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
            {serverError}
          </div>
        )}

        <div className="flex flex-col gap-1 relative z-50">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="someone@example.com"
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email && (
            <span className="text-xs text-red-500 font-medium">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 relative z-50">
          <Label htmlFor="password">Heslo</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••"
            {...register('password')}
            aria-invalid={errors.password ? 'true' : 'false'}
            className={
              errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''
            }
          />
          {errors.password && (
            <span className="text-xs text-red-500 font-medium">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center mt-2">
          <Link
            to="/registration"
            className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
          >
            Ještě nemáte účet?
          </Link>
          <Link
            to="/forgot-password"
            className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
          >
            Zapomenuté heslo?
          </Link>
        </div>

        <Button type="submit" disabled={isLoading} className="mt-2 h-11">
          {isLoading ? 'Přihlašování...' : 'Přihlásit se'}
        </Button>
      </form>
    </div>
  );
};

export default Login;
