import { useState, useEffect, useRef, useCallback } from 'react';
import $api from '@/api/axiosInstance';

/**
 * Hook pro správu vozového parku a jízdních souprav (Fleet Management).
 * * Zajišťuje:
 * 1. Načítání vozidel (tahače, návěsy) a spárovaných souprav (Compositions).
 * 2. Inteligentní přepínání tabů (zabraňuje načítání dat, pokud to není potřeba).
 * 3. Graceful error handling (pokud API vrátí 404 pro prázdnou tabulku, aplikace nespadne).
 * @todo (UX) Přidat stav 'isLoading', aby uživatel neviděl prázdnou tabulku dříve, než se data načtou z backendu.
 * @todo (Performance) Automatické cachování dat. Nyní se při každém překliknutí tabu volá API znovu.
 */
export const useFleet = () => {
  const [vehicles, setVehicles] = useState([]);
  const [compositions, setCompositions] = useState([]);
  const [activeTab, setActiveTab] = useState('vehicles');

  // --- API VOLÁNÍ PRO VOZIDLA ---
  const fetchVehicles = async () => {
    try {
      const res = await $api.get('vehicle/');
      const newData = res.data;
      setVehicles(newData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setVehicles([]);
      } else {
        console.error('Chyba při stahování dat:', error);
      }
    }
  };

  // --- API VOLÁNÍ PRO SOUPRAVY ---
  const fethcCompositions = async () => {
    try {
      const res = await $api.get('vehicle-composition/');
      const newData = res.data;
      setCompositions(newData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setCompositions([]);
      } else {
        console.error('Chyba při načítání souprav:', error);
      }
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
