import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import $api from '@/api/axiosInstance';

// Definice validačního schématu s logikou shody
const schema = z
  .object({
    password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hesla se neshodují.',
    path: ['confirmPassword'],
  });

/**
 * Komponenta pro nastavení nového hesla (Reset Password).
 * @todo (UX) Přidat možnost "zobrazit heslo" (ikonka oka), aby se předešlo překlepům.
 */
const ResetPassword = () => {
  // Získání tokenu z URL (?token=xyz)
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');

    try {
      await $api.post('/auth/reset-password', {
        token: token,
        password: data.password,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      setServerError(
        error.response?.data?.message || 'Něco se pokazilo. Zkuste to znovu.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Neplatný odkaz</h2>
        <p className="text-gray-600 mb-4">
          Odkaz pro obnovení hesla je neplatný nebo vypršel.
        </p>
        <Button asChild variant="outline">
          <Link to="/login">Zpět na přihlášení</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-surface p-8 rounded-xl w-full max-w-sm flex flex-col gap-6 shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary mb-2">Nové heslo</h2>
          <p className="text-sm text-gray-500">
            {isSubmitted
              ? 'Vaše heslo bylo úspěšně změněno. Nyní se můžete přihlásit.'
              : 'Zadejte své nové heslo.'}
          </p>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
            {serverError}
          </div>
        )}

        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1 relative z-50">
              <Label htmlFor="password">Nové heslo</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••"
                {...register('password')}
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password && (
                <span className="text-xs text-red-500 font-medium">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 relative z-50">
              <Label htmlFor="confirmPassword">Potvrďte heslo</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••••"
                {...register('confirmPassword')}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              />
              {errors.confirmPassword && (
                <span className="text-xs text-red-500 font-medium">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full mt-2">
              {isLoading ? 'Ukládám...' : 'Uložit nové heslo'}
            </Button>
          </form>
        ) : (
          <Button asChild className="w-full mt-2" variant="outline">
            <Link to="/login">Zpět na přihlášení</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
