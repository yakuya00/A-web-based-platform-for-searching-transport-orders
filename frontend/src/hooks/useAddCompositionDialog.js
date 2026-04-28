import React, { useState, useMemo, useDebugValue, useEffect } from 'react';
import $api from '@/api/axiosInstance';

export const useAddCompositionDialog = (onSuccess, vehicles) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);

  // Стейт конструктора сцепки
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    driver_id: '',
    truck_id: '',
    trailers: [], // 🔥 Массив для скандинавских сцепок!
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // 🔥 ФУНКЦИИ ДЛЯ РАБОТЫ С МАССИВОМ ПРИЦЕПОВ
  const addTrailerSlot = () => {
    setFormData((prev) => ({ ...prev, trailers: [...prev.trailers, ''] }));
  };

  const removeTrailerSlot = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      trailers: prev.trailers.filter((_, index) => index !== indexToRemove),
    }));
  };

  const updateTrailer = (index, value) => {
    const newTrailers = [...formData.trailers];
    newTrailers[index] = value;
    setFormData((prev) => ({ ...prev, trailers: newTrailers }));
  };

  const fetchDrivers = async () => {
    try {
      const res = await $api.get('company/drivers/');
      const newData = res.data;
      console.log(newData);
      setDrivers(newData);
    } catch (error) {
      console.error('Chyba při nacitani ridicu:', error);
      return [];
    }
  };

  const handleSave = async () => {
    console.log('Odesílám soupravu na backend:', formData);
    try {
      const payload = {
        ...formData,
        driver_id:
          formData.driver_id === 'none' || !formData.driver_id
            ? null
            : parseInt(formData.driver_id),
        truck_id: parseInt(formData.truck_id),
      };

      await $api.post('vehicle-composition/', payload);
      if (onSuccess) onSuccess(formData);
      setFormData({ name: '', driver_id: '', truck_id: '', trailers: [] });
    } catch (error) {
      console.error('Chyba při přidávání soustavy:', error);
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  // 🔥 Берем только ТЯГАЧИ, которые СВОБОДНЫ

  useEffect(() => {
    fetchDrivers();
  }, []);

  const availableTrucks = useMemo(() => {
    return vehicles.filter((v) => v.vehicle_type === 'truck' && v.is_available);
  }, [vehicles]);

  // 🔥 Берем только ПРИЦЕПЫ, которые СВОБОДНЫ
  const availableTrailers = useMemo(() => {
    return vehicles.filter(
      (v) => v.vehicle_type === 'trailer' && v.is_available
    );
  }, [vehicles]);

  return {
    data: {
      isDialogOpen,
      isLoading,
      formData,
      drivers,
      availableTrucks,
      availableTrailers,
      setIsDialogOpen,
      setFormData,
    },
    actions: {
      addTrailerSlot,
      updateTrailer,
      removeTrailerSlot,
      handleSave,
      handleChange,
    },
  };
};
