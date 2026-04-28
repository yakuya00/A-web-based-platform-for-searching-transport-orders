import React, { useState, useEffect } from 'react';
import $api from '@/api/axiosInstance';

export const useOrderOffersList = (orderId, onAccept) => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Для загрузки при нажатии кнопок

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await $api.get(`order/${orderId}/offer`);
      const newData = res.data;
      console.log(newData);
      setOffers(newData);
    } catch (error) {
      console.log('Chyba: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId, companyName) => {
    if (
      window.confirm(
        `Opravdu chcete přijmout nabídku od ${companyName}? Ostatní nabídky budou automaticky zamítnuty.`
      )
    ) {
      setIsProcessing(true);
      try {
        await $api.post(`order/offer/${offerId}/accept`);
      } catch (error) {
        console.log('Chyba: ', error);
      } finally {
        setIsProcessing(false);
        onAccept();
      }
    }
  };

  const handleRejectOffer = async (offerId) => {
    setIsProcessing(true);
    console.log(`Zamítám nabídku ID: ${offerId}`);
    // TODO: Запрос на бэкенд
    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
  };

  useEffect(() => {
    if (orderId) {
      fetchOffers();
    }
  }, [orderId]);

  return {
    data: {
      offers,
      isProcessing,
      isLoading,
    },
    actions: {
      fetchOffers,
      handleAcceptOffer,
      handleRejectOffer,
    },
  };
};
