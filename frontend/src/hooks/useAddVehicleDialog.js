import { useState, useEffect, useRef, useCallback } from 'react';
import $api from '@/api/axiosInstance';

/**
 * Hook pro správu stavu a logiky dialogu "Přidat vozidlo" (Tahač / Návěs).
 * * Řeší:
 * 1. Sběr technických parametrů vozidla (SPZ, rozměry, nosnost).
 * 2. Transformaci datových typů (string -> float/int) před odesláním na API.
 * 3. Základní validaci povinných polí.
 * @param {Function} onSuccess - Callback volaný po úspěšném přidání vozidla (pro refresh tabulky).
 * @todo (Refactor) Nahradit nativní 'alert'.
 * @todo (Architecture) Sjednotit formulář s 'react-hook-form' a 'zod'.
 */
export const useAddVehicleDialog = (onSuccess) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: 'truck',
    reg_number: '',
    brand: '',
    model: '',
    year_of_manufacture: '',
    length: '',
    height: '',
    capacity: '',
    volume: '',
    notes: undefined,
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!formData.reg_number || !formData.brand || !formData.vehicle_type) {
      alert('Vyplňte prosím SPZ, značku a typ vozidla.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        year_of_manufacture: parseInt(formData.year_of_manufacture),
        length: parseFloat(formData.length) || null,
        height: parseFloat(formData.height) || null,
        capacity: parseFloat(formData.capacity) || null,
        volume: parseFloat(formData.volume) || null,
      };

      await $api.post('vehicle/', payload);
      onSuccess();
      setFormData({
        vehicle_type: 'truck',
        reg_number: '',
        brand: '',
        model: '',
        year_of_manufacture: '',
        length: '',
        height: '',
        capacity: '',
        volume: '',
        notes: undefined,
      });
    } catch (error) {
      console.error('Chyba při přidávání vozidla:', error);
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  return {
    data: {
      formData,
      isLoading,
      isDialogOpen,
      setFormData,
      setIsDialogOpen,
    },
    actions: {
      handleChange,
      handleSave,
    },
  };
};
