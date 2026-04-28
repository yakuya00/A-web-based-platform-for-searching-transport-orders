import React, { useState, useEffect } from 'react';
import $api from '@/api/axiosInstance';

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
      console.log('Chyba: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Имитация загрузки с бэкенда
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
