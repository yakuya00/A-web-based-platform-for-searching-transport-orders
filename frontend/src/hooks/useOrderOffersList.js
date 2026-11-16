import React, { useState, useEffect } from 'react';
import $api from '@/api/axiosInstance';

/**
 * Hook pro správu seznamu došlých nabídek k vypsané zakázce.
 * @param {number|string} orderId - ID zakázky, pro kterou nabídky načítáme.
 * @param {Function} onAccept - Callback volaný po úspěšném přijetí nabídky (např. pro zavření modalu a refresh detailu).
 * @todo (UX) Nahradit `window.confirm` za hezčí Shadcn <AlertDialog>.
 * @todo (UX/Notifications) Přidat integraci s Toast notifikacemi (např. "Nabídka od firmy XY byla přijata").
 */
export const useOrderOffersList = (orderId, onAccept) => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await $api.get(`order/${orderId}/offer`);
      const newData = res.data;
      setOffers(newData);
    } catch (error) {
      console.error(error);
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
        console.error(error);
      } finally {
        setIsProcessing(false);
        onAccept();
      }
    }
  };

  const handleRejectOffer = async (offerId) => {
    setIsProcessing(true);
    console.log(`Zamítám nabídku ID: ${offerId}`);
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
