import { useState, useEffect, useRef, useCallback } from 'react';
import $api from '@/api/axiosInstance';

export const useAddVehicleDialog = (onSuccess) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Стейт формы
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
