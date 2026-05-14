import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import InputAutoComplete from '@/components/ui/InputAutoComplete';
import { useNominatim } from '@/hooks/useNominatim';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  companyName: z.string().min(2, 'Zadejte prosím název společnosti.'),
  companyIdentifier: z
    .string()
    .min(6, 'Zadejte platné IČO.')
    .regex(/^\d{8}$/, 'Zadejte platné IČO.'),
  nominatium_data: z.any().refine((val) => val !== null && val !== '', {
    message: 'Vyberte prosím adresu vaší společnosti ze seznamu.',
  }),
});

/**
 * Druhý krok registrace: Sběr firemních údajů.
 * * Klíčové vlastnosti:
 * 1. Validace IČO: Regex kontrola na 8 číslic (český standard).
 * 2. Integrace Geocodingu: Využívá Nominatim API pro našeptávání adresy sídla.
 * 3. Zod Schema: Zajišťuje, že uživatel nepokračuje bez reálného výběru adresy ze seznamu.
 * @param {Object} props
 * @param {Object} props.data - Aktuální stav registrace uložený v nadřazeném krokovém formuláři.
 * @param {Function} props.updateData - Funkce pro synchronizaci lokálních dat s globálním registračním stavem.
 * @param {Function} props.onNext - Přechod na další krok (např. výběr typu firmy).
 * @param {Function} props.onBack - Návrat na předchozí krok (registrace uživatele).
 * @todo (Refactor) Vyčlenit Zod schéma do externího souboru 'schemas/registration.js'.
 * @todo (Feature) Implementovat vyber zeme.
 * @todo (Architecture) Dynamická validace IČO: Místo hardkódovaného regexu v Zod schématu načítat 'regex_pattern' z databáze podle vybrané země.
 * @todo (Refactor) PŘEVÉST CELÝ KOMPONENT NA SHADCN UI.
 */
export const CompanyForm = ({ data, updateData, onNext, onBack }) => {
  const address = useNominatim();
  const [isTyping, setIsTyping] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: data.companyName || '',
      companyIdentifier: data.companyIdentifier || '',
      nominatium_data: data.nominatium_data || null,
    },
  });

  const onSubmitForm = (formData) => {
    updateData(formData);
    onNext();
  };

  const handleAddressSelect = (item) => {
    setIsTyping(true);
    address.selectItem(item);
    setValue('nominatium_data', item, { shouldValidate: true });
  };

  const handleAddressChange = (e) => {
    setIsTyping(true);
    address.handleInputChange(e);
    setValue('nominatium_data', null, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-center text-gray-700">
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
