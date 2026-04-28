import React, { useState, useEffect } from 'react';
import $api from '@/api/axiosInstance';

export const useAssighVehicleDialog = (isOpen, orderId, onSuccess, onClose) => {
  const [compositions, setCompositions] = useState([]);
  const [selectedCompositionId, setSelectedCompositionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загружаем список свободных машин, когда модалка открывается
  useEffect(() => {
    if (isOpen) {
      const fetchCompositions = async () => {
        setIsLoading(true);
        try {
          const res = await $api.get('vehicle-composition/available');
          const newData = res.data;
          setCompositions(newData);
        } catch (error) {
          console.error('Chyba při načítání vozidel:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCompositions();
    } else {
      // Очищаем стейт при закрытии
      setSelectedCompositionId('');
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedCompositionId) return;

    setIsSubmitting(true);
    try {
      console.log(orderId);
      console.log(selectedCompositionId);
      await $api.post(`order/${orderId}/assign-vehicle`, {
        compositionId: selectedCompositionId,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Chyba při přiřazování:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Nastala chyba při přiřazování vozidla.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    data: {
      compositions,
      isLoading,
      isSubmitting,
      selectedCompositionId,
      setSelectedCompositionId,
    },
    actions: {
      handleAssign,
    },
  };
};
