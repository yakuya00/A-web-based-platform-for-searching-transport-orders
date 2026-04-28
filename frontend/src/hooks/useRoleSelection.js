import React, { useEffect, useState } from 'react';
import $api from '@/api/axiosInstance';

export const useRoleSelection = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await $api.get('http://localhost:5000/company/roles');
        const newData = res.data;
        setRoles(newData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { roles, isLoading };
};
