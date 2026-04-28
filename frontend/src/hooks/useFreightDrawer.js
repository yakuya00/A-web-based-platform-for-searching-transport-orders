import React, { useState, useMemo, useDebugValue, useEffect } from 'react';
import $api from '@/api/axiosInstance';

export const useFreightDrawer = (isOpen, freightId, onClose) => {
  const [freight, setFreight] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Если панель закрыта или нет данных — ничего не рендерим

  useEffect(() => {
    if (isOpen && freightId) {
      const freightDetails = async () => {
        setIsLoading(true);
        try {
          const res = await $api.get(`order/${freightId}`);
          console.log(res.data);
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

  const handleSubmitOffer = async () => {
    if (!offerPrice) return;
    setIsSubmitting(true);

    // TODO: Запрос на бэкенд
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
