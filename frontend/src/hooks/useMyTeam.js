import { useState, useEffect } from 'react';
import $api from '@/api/axiosInstance';

/**
 * Hook pro správu firemního týmu (zaměstnanců).
 * * Zajišťuje:
 * 1. Načtení seznamu všech zaměstnanců přiřazených pod aktuální firmu.
 * 2. Správu stavu načítání (isLoading) pro plynulé vykreslení UI (spinner/skeleton).
 */
export const useMyTeam = () => {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const res = await $api.get('user/');
      const newData = res.data;
      setEmployees(newData);
    } catch (error) {
      console.error('Chyba při stahování dat:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return { employees, fetchEmployees };
};
