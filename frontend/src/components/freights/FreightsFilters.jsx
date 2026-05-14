import React from 'react';
import InputAutoComplete from '@/components/ui/InputAutoComplete';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';

const typeOptions = [
  { id: 'all', name: 'Všechny typy' },
  { id: 'plachta', name: 'Plachta (Standard)' },
  { id: 'frigo', name: 'Frigo (Chlaďák)' },
  { id: 'dodavka', name: 'Dodávka (do 3.5t)' },
];

/**
 * Filtrační panel pro vyhledávání přepravních zakázek (Freights).
 * * Tento komponent slouží jako horizontální vyhledávací lišta, která kombinuje:
 * 1. Geografické vyhledávání pomocí našeptávače (Autocomplete).
 * 2. Kategorizaci podle typu nástavby (plachta, frigo, atd.).
 * 3. Numerické rozmezí pro tonáž nákladu.
 * @param {Object} props
 * @param {Object} props.filters - Objekt obsahující stavy a handlery pro všechny filtry.
 * @param {boolean} props.isLoading - Indikátor probíhajícího API požadavku (vypíná tlačítko).
 * @param {Function} props.handleSearch - Funkce spouštěná při kliknutí na tlačítko "Hledat".
 * @todo (Refactor) Vyčlenit 'typeOptions' do globálních konstant (constants/freights.js).
 * @returns {JSX.Element}
 */
const FreightsFilters = ({ filters, isLoading, handleSearch }) => {
  const {
    fromLocation,
    toLocation,
    cargoType,
    setCargoType,
    fromWeight,
    setFromWeight,
    toWeight,
    setToWeight,
  } = filters;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
      <InputAutoComplete
        label="Odkud (Lokalita)"
        placeholder="Země, Město nebo PSČ..."
        value={fromLocation.query}
        onChange={fromLocation.handleInputChange}
        items={fromLocation.items}
        isLoading={fromLocation.isLoading}
        isSelected={fromLocation.isSelected}
        onItemSelect={fromLocation.selectItem}
      />

      <div className="hidden md:flex pb-3 text-gray-400">
        <svg
          className="size-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </div>

      <InputAutoComplete
        label="Kam"
        placeholder="Město nebo PSČ"
        value={toLocation.query}
        onChange={toLocation.handleInputChange}
        items={toLocation.items}
        isLoading={toLocation.isLoading}
        isSelected={toLocation.isSelected}
        onItemSelect={toLocation.selectItem}
      />

      <Field className="w-48 shrink-0">
        <FieldLabel>Typ nákladu</FieldLabel>
        <Select value={cargoType} onValueChange={setCargoType} className="h-11">
          <SelectTrigger>
            <SelectValue placeholder="Všechny typy" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field className="shrink-0 w-40">
        <FieldLabel>Váha (t)</FieldLabel>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Od"
            type="number"
            min="0"
            step="0.5"
            value={fromWeight}
            onChange={(e) => setFromWeight(e.target.value)}
          />
          <span className="text-gray-400 font-medium">-</span>
          <Input
            placeholder="Do"
            type="number"
            min="0"
            step="0.5"
            value={toWeight}
            onChange={(e) => setToWeight(e.target.value)}
          />
        </div>
      </Field>

      <Button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Hledám...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Hledat
          </>
        )}
      </Button>
    </div>
  );
};

export default FreightsFilters;
