import { useState, useEffect, useRef, useCallback } from 'react';
import $api from '@/api/axiosInstance';

export const useFleet = () => {
  const [vehicles, setVehicles] = useState([]);
  const [compositions, setCompositions] = useState([]);
  const [activeTab, setActiveTab] = useState('vehicles');
  const fetchVehicles = async () => {
    try {
      const res = await $api.get('vehicle/');
      const newData = res.data;
      setVehicles(newData);
    } catch (error) {
      console.error('Chyba při stahování dat:', error);
    }
  };

  const fethcCompositions = async () => {
    try {
      const res = await $api.get('vehicle-composition/');
      const newData = res.data;
      setCompositions(newData);
    } catch (error) {
      console.error('Chyba při stahování dat:', error);
    }
  };
  useEffect(() => {
    fetchVehicles();
  }, []);
  useEffect(() => {
    activeTab === 'vehicles' ? fetchVehicles() : fethcCompositions();
  }, [activeTab]);

  return {
    data: {
      vehicles,
      compositions,
      activeTab,
      setActiveTab,
    },
    actions: {
      fetchVehicles,
      fethcCompositions,
    },
  };
};
