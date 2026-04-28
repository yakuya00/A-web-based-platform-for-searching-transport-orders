import { useState, useEffect, useRef, useCallback } from 'react';
import $api from '@/api/axiosInstance';
import { useNominatim } from '@/hooks/useNominatim';

export const useFreights = () => {
  const fromLocation = useNominatim();
  const toLocation = useNominatim();

  const [cargoType, setCargoType] = useState('');
  const [fromWeight, setFromWeight] = useState('');
  const [toWeight, setToWeight] = useState('');

  const [freights, setFreights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isLoadingRef = useRef(isLoading);
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Наблюдатель за бесконечным скроллом
  const observer = useRef(null);
  const lastFreightElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
          console.log('🔥 ДОКРУТИЛИ ДО КОНЦА! Грузим страницу:', page + 1);
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  const fetchFreights = async (pageNum, isNewSearch = false) => {
    setIsLoading(true);
    try {
      const params = {
        fromLat: fromLocation.selectedItem?.lat || undefined,
        fromLon: fromLocation.selectedItem?.lon || undefined,
        toLan: toLocation.selectedItem?.lat || undefined,
        toLon: toLocation.selectedItem?.lon || undefined,
        type: cargoType !== '' ? cargoType : undefined,
        minWeight: fromWeight || undefined,
        maxWeight: toWeight || undefined,
        page: pageNum,
      };

      const res = await $api.get('order/search', { params });
      const newData = res.data;
      setHasMore(newData.length === 20);

      if (isNewSearch) {
        setFreights(newData);
      } else {
        setFreights((prev) => [...prev, ...newData]);
      }
    } catch (error) {
      console.error('Chyba při stahování dat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    console.log('🔥 КНОПКА НАЖАТА!');
    setPage(1);
    fetchFreights(1, true);
  };

  // Первичная загрузка
  useEffect(() => {
    fetchFreights(1, true);
  }, []);

  // Подгрузка при смене страницы
  useEffect(() => {
    if (page > 1) {
      fetchFreights(page, false);
    }
  }, [page]);

  // Возвращаем аккуратно упакованные данные
  return {
    filters: {
      fromLocation,
      toLocation,
      cargoType,
      setCargoType,
      fromWeight,
      setFromWeight,
      toWeight,
      setToWeight,
    },
    data: {
      freights,
      isLoading,
      lastFreightElementRef,
    },
    actions: {
      handleSearch,
    },
  };
};
