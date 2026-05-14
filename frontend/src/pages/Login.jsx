import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/useLogin';

/**
 * Komponenta Login - Hlavní přihlašovací formulář.
 */
const Login = () => {
  const { data, actions } = useLogin();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={actions.handleSubmit(actions.onSubmit)}
        className="bg-surface p-8 rounded-xl w-full max-w-sm flex flex-col gap-5 shadow-lg border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-2">
          Přihlášení
        </h2>
        {data.serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
            {data.serverError}
          </div>
        )}

        <div className="flex flex-col gap-1 relative z-50">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="someone@example.com"
            {...data.register('email')}
            aria-invalid={data.errors.email ? 'true' : 'false'}
          />
          {data.errors.email && (
            <span className="text-xs text-red-500 font-medium">
              {data.errors.email.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 relative z-50">
          <Label htmlFor="password">Heslo</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••"
            {...data.register('password')}
            aria-invalid={data.errors.password ? 'true' : 'false'}
            className={
              data.errors.password
                ? 'border-red-500 focus-visible:ring-red-500'
                : ''
            }
          />
          {data.errors.password && (
            <span className="text-xs text-red-500 font-medium">
              {data.errors.password.message}
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

        <Button type="submit" disabled={data.isLoading} className="mt-2 h-11">
          {data.isLoading ? 'Přihlašování...' : 'Přihlásit se'}
        </Button>
      </form>
    </div>
  );
};

export default Login;
