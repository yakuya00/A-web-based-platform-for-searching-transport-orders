import { useState, useEffect, useRef, useCallback } from 'react';
import $api from '@/api/axiosInstance';

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
