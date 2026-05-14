import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { mobileRegex } from '@/config/regexConfig';
import { Eye, EyeOff } from 'lucide-react';

const today = new Date();
const minAgeDate = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
);
const maxAgeDate = new Date(
  today.getFullYear() - 120,
  today.getMonth(),
  today.getDate()
);

// 🔥 1. МАГИЯ ZOD (Вся логика валидации здесь)
const schema = z.object({
  name: z.string().min(2, 'Zadejte prosím své jméno.'),
  surname: z.string().min(2, 'Zadejte prosím své příjmení.'),
  phone: z.string().regex(mobileRegex, 'Zadejte platné telefonní číslo.'),

  email: z.string().email('Zadejte platný email.'),
  password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků.'),

  // 🔥 Вот это просто отвал башки! Вся твоя сложная логика даты в 5 строчках:
  birthday: z
    .string()
    .min(1, 'Vyberte prosím datum narození.')
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: 'Neplatné datum.',
    })
    .refine((val) => new Date(val) <= minAgeDate, {
      message: 'Musíte mít alespoň 18 let.',
    })
    .refine((val) => new Date(val) >= maxAgeDate, {
      message: 'Zadejte prosím své skutečné datum narození.',
    }),
});

/**
 * Finální krok registrace: Osobní údaje správce (Managera).
 * @param {Object} props
 * @param {Object} props.data - Dosud nasbíraná data z předchozích kroků.
 * @param {Function} props.updateData - Funkce pro synchronizaci stavu.
 * @param {Function} props.onSubmit - Finální funkce volající API registraci.
 * @param {Function} props.onBack - Návrat k údajům o společnosti.
 * @todo (UX) Přidat kontrolu síly hesla (indikátor: slabé/střední/silné).
 * @todo (Security) Implementovat potvrzení hesla (Confirm Password field).
 * @todo (Refactor) Vyčlenit schema do 'schemas/registration.js'.
 * @todo (Refactor) PŘEVÉST CELÝ KOMPONENT NA SHADCN UI.
 */
export const ManagerForm = ({ data, updateData, onSubmit, onBack }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data.name || '',
      surname: data.surname || '',
      birthday: data.birthday || '',
      phone: data.phone || '',
      email: data.email || '',
      password: data.password || '',
    },
  });

  const onSubmitForm = (formData) => {
    updateData(formData);
    onSubmit(formData);
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-center text-gray-700">
        Vaše údaje
      </h2>

      <div className="flex flex-col gap-1 relative z-50">
        <Label htmlFor="name">Jméno</Label>
        <Input
          id="name"
          placeholder="John"
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <span className="text-xs text-red-500 font-medium">
            {errors.name.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 relative z-50">
        <Label htmlFor="surname">Příjmení</Label>
        <Input
          id="surname"
          placeholder="Doe"
          {...register('surname')}
          aria-invalid={errors.surname ? 'true' : 'false'}
        />
        {errors.surname && (
          <span className="text-xs text-red-500 font-medium">
            {errors.surname.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 relative z-50">
        <Label htmlFor="birthday">Datum narození</Label>
        <Input
          id="birthday"
          type="date"
          {...register('birthday')}
          aria-invalid={errors.birthday ? 'true' : 'false'}
        />
        {errors.birthday && (
          <span className="text-xs text-red-500 font-medium">
            {errors.birthday.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 relative z-50">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          placeholder="+420 123 456 789"
          {...register('phone')}
          aria-invalid={errors.phone ? 'true' : 'false'}
        />
        {errors.phone && (
          <span className="text-xs text-red-500 font-medium">
            {errors.phone.message}
          </span>
        )}
      </div>

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
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••"
            {...register('password')}
            aria-invalid={errors.password ? 'true' : 'false'}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {errors.password && (
          <span className="text-xs text-red-500 font-medium">
            {errors.password.message}
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="button" onClick={onBack} variant="tab">
          Zpět
        </Button>
        <Button
          type="submit"
          className="flex-auto bg-green-600 hover:bg-green-700"
        >
          Zaregistrovat se
        </Button>
      </div>
    </form>
  );
};
