import React, { useState, useEffect } from 'react';
import $api from '@/api/axiosInstance';

/**
 * Hlavní hook pro obsluhu rozhraní řidiče (Driver App).
 * * Řeší:
 * 1. Načítání zakázek, které dispečink přiřadil aktuálně přihlášenému řidiči.
 * 2. Správu stavu pro otevření/zavření modulu fotoaparátu (skeneru).
 * 3. Odesílání a verifikaci naskenovaných QR tokenů vůči backendu.
 * @todo (UX) Nahradit 'alert' chybové hlášky za vizuální červenou obrazovku nebo Toast.
 */
export const useDriverApp = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeScanOrder, setActiveScanOrder] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchDriverOrders();
  }, []);

  const fetchDriverOrders = async () => {
    setIsLoading(true);
    try {
      const res = await $api.get('/order/driver');
      setOrders(res.data);
    } catch (error) {
      console.error('Chyba při načítání zakázek:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async (text) => {
    if (text && activeScanOrder) {
      setIsVerifying(true);

      try {
        await $api.post(`/order/${activeScanOrder}/scan-qr`, { token: text });
        setScanResult(
          '✅ Úspěšně naskenováno! Status zakázky byl aktualizován.'
        );
        setIsVerifying(false);
        fetchDriverOrders();
      } catch (error) {
        alert('❌ Neplatný QR kód pro tuto zakázku.');
        setIsVerifying(false);
      }
    }
  };

  const closeScanner = () => {
    setActiveScanOrder(null);
    setScanResult(null);
  };

  return {
    data: {
      orders,
      isLoading,
      activeScanOrder,
      scanResult,
      isVerifying,
      setActiveScanOrder,
    },
    actions: {
      handleScan,
      closeScanner,
    },
  };
};
