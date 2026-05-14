import { useState, useEffect, useRef, useCallback } from 'react';
import $api from '@/api/axiosInstance';

/**
 * Hook pro správu vlastních zakázek uživatele (Aktivní / Historie).
 * @todo (UX) Nahradit nativní window.confirm() a window.prompt() za Shadcn.
 */
export const useMyFreights = () => {
  const [freights, setFreights] = useState([]);
  const [currentTab, setCurrentTab] = useState('active');
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const isLoadingRef = useRef(isLoading);
  const observer = useRef(null);

  const fetchFreights = async (
    pageNum,
    tabToFetch = currentTab,
    isNewSearch = false
  ) => {
    setIsLoading(true);
    try {
      const res = await $api.get('order/my-active', {
        params: { page: pageNum, tab: tabToFetch },
      });
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

  const handleTabChange = async (newTab) => {
    setCurrentTab(newTab);
    setFreights([]);
    setPage(1);
    setHasMore(true);
    fetchFreights(1, newTab, true);
  };

  const handleDelete = async (freightId) => {
    if (!window.confirm('Opravdu chcete smazat tento náklad?')) return;
    try {
      await $api.delete(`order/${freightId}`);
      setFreights(freights.filter((f) => f.id !== freightId));
    } catch (error) {
      console.error('Chyba při mazani dat:', error);
    }
  };

  const handleCancel = async (freightId) => {
    const reason = window.prompt(
      'UPOZORNĚNÍ: Zrušení přijaté přepravy (Storno) může podléhat sankcím dle smlouvy!\n\nZadejte prosím důvod storna:'
    );
    if (reason === null || reason.trim() === '') {
      return;
    }
    try {
      await $api.post(`order/cancell/${freightId}`);
      setFreights(freights.filter((f) => f.id !== freightId));
    } catch (error) {
      console.error('Chyba při stornovani:', error);
    }
  };

  const lastFreightElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    fetchFreights(1, currentTab, true);
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchFreights(page, currentTab, false);
    }
  }, [page]);

  return {
    data: {
      freights,
      currentTab,
      lastFreightElementRef,
    },
    actions: {
      fetchFreights,
      handleDelete,
      handleTabChange,
      handleCancel,
    },
  };
};
