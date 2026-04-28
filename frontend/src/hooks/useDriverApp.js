import React, { useState, useMemo, useDebugValue, useEffect } from 'react';
import $api from '@/api/axiosInstance';

export const useDriverApp = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Стейты для сканера
  const [activeScanOrder, setActiveScanOrder] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Загружаем список рейсов при открытии
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

  // Обработка успешного сканирования
  const handleScan = async (text) => {
    console.log(text);
    if (text && activeScanOrder) {
      setIsVerifying(true);

      try {
        // TODO: Здесь будет API вызов для проверки токена на бэкенде
        await $api.post(`/order/${activeScanOrder}/scan-qr`, { token: text });

        console.log(`Odesílám token ${text} pro zakázku ${activeScanOrder}`);

        setTimeout(() => {
          setScanResult(
            '✅ Úspěšně naskenováno! Status zakázky byl aktualizován.'
          );
          setIsVerifying(false);
          // Обновляем список, чтобы сменился статус
          fetchDriverOrders();
        }, 1500);
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
