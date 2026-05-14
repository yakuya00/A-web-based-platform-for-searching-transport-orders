import React, { useState, useEffect } from 'react';
import $api from '@/api/axiosInstance';

/**
 * Hook pro správu stavu a logiky postranního panelu s detailem zakázky (Freight Drawer).
 * * Zajišťuje:
 * 1. Automatické načtení detailů zakázky z API po otevření panelu.
 * 2. Správu stavu formuláře pro podání cenové nabídky (včetně odesílání).
 * 3. Error handling (např. ošetření HTTP 409 Conflict, kdy už firma nabídku podala).
 * 4. Úklid stavu při zavření, aby se zabránilo "problikávání" starých dat.
 * @param {boolean} isOpen - Určuje, zda je panel aktuálně otevřený.
 * @param {number|string} freightId - ID zakázky pro načtení detailů.
 * @param {Function} onClose - Callback z rodiče pro fyzické zavření panelu.
 * @todo (UX) Nahradit 'alert' Toast notifikací.
 * @todo (Validation) Zamezit odeslání záporné ceny nebo nesmyslně nízké/vysoké částky.
 */
export const useFreightDrawer = (isOpen, freightId, onClose) => {
  const [freight, setFreight] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NAČÍTÁNÍ DAT ---
  useEffect(() => {
    if (isOpen && freightId) {
      const freightDetails = async () => {
        setIsLoading(true);
        try {
          const res = await $api.get(`order/${freightId}`);
          setFreight(res.data);
        } catch (err) {
          console.error('Chyba při stahování detailů:', err);
        } finally {
          setIsLoading(false);
        }
      };
      freightDetails();
    } else {
      setFreight(null);
    }
  }, [isOpen, freightId]);

  // --- ODESLÁNÍ NABÍDKY ---
  const handleSubmitOffer = async () => {
    if (!offerPrice) return;
    setIsSubmitting(true);

    try {
      await $api.post(`order/${freightId}/offer`, {
        price: parseFloat(offerPrice),
      });

      setShowOfferForm(false);
      setOfferPrice('');
      onClose();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert('Vaše společnost již podala nabídku na tuto zakázku.');
      } else {
        alert('Došlo k chybě při odesílání nabídky. Zkuste to prosím znovu.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    onClose();
    setOfferPrice('');
    setShowOfferForm(false);
  };

  return {
    data: {
      freight,
      isLoading,
      showOfferForm,
      offerPrice,
      isSubmitting,
      setShowOfferForm,
      setOfferPrice,
    },
    actions: {
      handleSubmitOffer,
      handleClose,
    },
  };
};
