import React, { useState, useEffect } from 'react';
import $api from '@/api/axiosInstance';

/**
 * Hook pro správu odeslaných cenových nabídek uživatele (My Offers).
 * @todo (Feature) Přidat funkci 'revokeOffer' (Zrušit nabídku), pokud si to dopravce rozmyslí ještě předtím, než ji odesílatel přijme.
 * @todo (UX) Odchytit 'error' stav a zobrazit Toast notifikaci.
 */
export const useMyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyOffers = async () => {
    try {
      setIsLoading(true);
      const res = await $api.get('/order/my-offers');
      const newData = res.data;
      setOffers(newData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOffers();
  }, []);

  return {
    data: {
      offers,
      isLoading,
    },
    actions: {
      fetchMyOffers,
    },
  };
};
