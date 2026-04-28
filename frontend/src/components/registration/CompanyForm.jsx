import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input'; // Твой компонент Input
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import InputAutoComplete from '@/components/ui/InputAutoComplete'; // Твой компонент Input
import { useNominatim } from '@/hooks/useNominatim';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  companyName: z.string().min(2, 'Zadejte prosím název společnosti.'),
  // IČO в Чехии обычно состоит из 8 цифр
  companyIdentifier: z.string().min(6, 'Zadejte platné IČO.'),
  // Проверяем, что юзер не просто ввел текст, а реально выбрал адрес из списка
  nominatium_data: z.any().refine((val) => val !== null && val !== '', {
    message: 'Vyberte prosím adresu vaší společnosti ze seznamu.',
  }),
});

export const CompanyForm = ({ data, updateData, onNext, onBack }) => {
  const address = useNominatim();
  const [isTyping, setIsTyping] = useState(false);
  const {
    register, // Для привязки обычных инпутов
    handleSubmit, // Перехватчик отправки
    setValue, // Для ручной записи сложных данных (адреса)
    formState: { errors }, // Отсюда достаем ошибки
  } = useForm({
    resolver: zodResolver(schema), // Подключаем наши правила Zod
    defaultValues: {
      companyName: data.companyName || '',
      companyIdentifier: data.companyIdentifier || '',
      nominatium_data: data.nominatium_data || null,
    },
  });

  const onSubmitForm = (formData) => {
    updateData(formData); // Закидываем данные в общий стейт (для всей регистрации)
    onNext(); // Переключаем шаг
  };

  // 🔥 4. ФИШКА ДЛЯ КАСТОМНОГО АВТОКОМПЛИТА
  // Когда юзер выбирает адрес из списка хука
  const handleAddressSelect = (item) => {
    setIsTyping(true);
    address.selectItem(item);
    // Принудительно говорим форме: "Смотри, поле nominatium_data заполнено! Ошибок нет."
    setValue('nominatium_data', item, { shouldValidate: true });
  };

  // Если юзер начал стирать адрес вручную — сбрасываем выбор в форме
  const handleAddressChange = (e) => {
    setIsTyping(true);
    address.handleInputChange(e);
    setValue('nominatium_data', null, { shouldValidate: true });
  };

  // Инициализация автокомплита при возврате назад (чтобы текст в поле не пропадал)
  // useEffect(() => {
  //   if (data.nominatium_data && !address.isSelected) {
  //     setValue('nominatium_data', data.nominatium_data);
  //   }
  // }, []);

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-center text-secondary">
        Údaje o společnosti
      </h2>
      <div className="flex flex-col gap-1 relative z-50">
        <Label htmlFor="companyName">Název společnosti</Label>
        <Input
          id="companyName"
          placeholder="Trans-Logistics s.r.o."
          {...register('companyName')}
          aria-invalid={errors.companyName ? 'true' : 'false'}
        />
        {errors.companyName && (
          <span className="text-xs text-red-500 font-medium">
            {errors.companyName.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 relative z-50">
        <Label htmlFor="companyIdentifier">IČO</Label>
        <Input
          id="companyIdentifier"
          placeholder="12345678"
          {...register('companyIdentifier')}
          aria-invalid={errors.companyIdentifier ? 'true' : 'false'}
        />
        {errors.companyIdentifier && (
          <span className="text-xs text-red-500 font-medium">
            {errors.companyIdentifier.message}
          </span>
        )}
      </div>
      <InputAutoComplete
        label="Sídlo společnosti"
        placeholder="Začněte psát adresu (min. 3 znaky)..."
        // Значение берем из хука или из глобального стейта
        value={
          isTyping
            ? address.fullQuery
            : data.nominatium_data?.display_name || ''
        }
        onChange={handleAddressChange}
        isLoading={address.isLoading}
        items={address.items}
        onItemSelect={handleAddressSelect}
        isSelected={address.isSelected || !!data.nominatium_data}
        // Ошибка из формы RHF
        error={errors.nominatium_data?.message}
      />

      <div className="flex gap-2 mt-4">
        <Button type="button" onClick={onBack} variant="tab">
          Zpět
        </Button>
        <Button type="submit" className="flex-auto">
          Pokračovat
        </Button>
      </div>
    </form>
  );
};
