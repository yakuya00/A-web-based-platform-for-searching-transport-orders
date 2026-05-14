import React, { useState, useEffect } from 'react';
import $api from '@/api/axiosInstance';

/**
 * Hook pro správu logiky dialogu "Přiřadit vozidlo k zakázce".
 * * Řeší:
 * 1. Načtení pouze *dostupných* (volných) jízdních souprav při otevření dialogu.
 * 2. Správu stavu výběru konkrétní soupravy.
 * 3. Odeslání API requestu pro propojení zakázky se soupravou (a následné generování QR kódů).
 * 4. Úklid stavu (vyčištění výběru) při zavření modálního okna.
 * @param {boolean} isOpen - Spouštěč pro načtení dat (fetch se provede jen při otevření).
 * @param {number|string} orderId - ID zakázky, ke které se vozidlo přiřazuje.
 * @param {Function} onSuccess - Callback volaný po úspěšném přiřazení (refresh UI/zavření dialogu).
 * @param {Function} onClose - Callback pro zavření modálního okna při chybě nebo po dokončení.
 * @todo (UX) Nahradit nativní 'alert' moderní toast notifikací.
 */
export const useAssighVehicleDialog = (isOpen, orderId, onSuccess, onClose) => {
  const [compositions, setCompositions] = useState([]);
  const [selectedCompositionId, setSelectedCompositionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NAČÍTÁNÍ DOSTUPNÝCH VOZIDEL ---
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
      setSelectedCompositionId('');
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedCompositionId) return;

    setIsSubmitting(true);
    try {
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
