import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import $api from '@/api/axiosInstance';
import * as z from 'zod';

const schema = z.object({
  email: z.email('Zadejte platný email.'),
});

/**
 * Komponenta pro vyžádání odkazu na obnovu hesla.
 * @todo (UX) Přidat "Resend email" timer (např. po 60 sekundách), pokud uživatel email neobdržel.
 * @todo (Refactor) SHADCN UI
 */
const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await $api.post(`/auth/forgot-password`, { email: data.email });
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="bg-surface p-8 rounded-xl w-full max-w-sm flex flex-col gap-6 shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary mb-2">
            Zapomenuté heslo
          </h2>
          <p className="text-sm text-gray-500">
            {isSubmitted
              ? 'Pokud účet s tímto emailem existuje, odeslali jsme na něj instrukce k obnově hesla.'
              : 'Zadejte svůj email a my vám zašleme odkaz pro obnovení hesla.'}
          </p>
        </div>

        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
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

            <Button type="submit" disabled={isLoading} className="w-full mt-2">
              {isLoading ? 'Odesílám...' : 'Obnovit heslo'}
            </Button>
          </form>
        ) : (
          <Button asChild className="w-full mt-2" variant="outline">
            <Link to="/login">Zpět na přihlášení</Link>
          </Button>
        )}

        {!isSubmitted && (
          <div className="text-center mt-2">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Zpět na přihlášení
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
