import React, { useEffect, useState } from 'react';
import $api from '@/api/axiosInstance';

/**
 * Hook pro načtení a správu statistik pro dashboard (Stats Cards).
 */
export const useStatsCards = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await $api.get('http://localhost:5000/common/stats');
        const newData = res.data;

        setData(newData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading };
};
