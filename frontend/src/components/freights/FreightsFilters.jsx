import React from 'react';

import InputAutoComplete from '@/components/ui/InputAutoComplete';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';

const typeOptions = [
  { id: 'all', name: 'Všechny typy' },
  { id: 'plachta', name: 'Plachta (Standard)' },
  { id: 'frigo', name: 'Frigo (Chlaďák)' },
  { id: 'dodavka', name: 'Dodávka (do 3.5t)' },
];

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

      {/* Иконка стрелочки между городами */}
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

      {/* 🔥 Поле с весом, обернутое в Field */}
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
        {isLoading ? '⏳ Hledám...' : '🔍 Hledat'}
      </Button>
    </div>
  );
};

export default FreightsFilters;
