import { useState, useEffect, useRef, useCallback } from 'react';
import $api from '@/api/axiosInstance';

/**
 * Hook pro logiku a stav dialogového okna "Přidat zaměstnance" (MyTeamDialog).
 * * Zajišťuje:
 * 1. Načtení dostupných firemních rolí (Admin, Manager, Driver) při otevření modalu.
 * 2. Dynamickou validaci polí (Řidiči nepotřebují přihlašovací údaje, Dispečeři ano).
 * 3. Odeslání registračních dat na backend a následný refresh tabulky týmu.
 * @param {Function} onSuccess - Callback volaný po úspěšném vytvoření uživatele (např. pro refresh tabulky).
 * @todo (Validation) Přepsat validaci do Zod/React-Hook-Form pro konzistenci s `ManagerForm` a `useLogin`.
 */
export const useMyTeamDialog = (onSuccess) => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    role_id: undefined,
    name: '',
    surname: '',
    birthday: '',
    phone: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.surname || !formData.phone) {
      alert('Vyplňte prosím všechna povinná pole (Jméno, Příjmení, Telefon).');
      return;
    }

    if (!formData.email || !formData.password) {
      alert('Pro administrátory a dispečery je nutné vyplnit email a heslo.');
      return;
    }

    setIsLoading(true);
    console.log(formData);
    try {
      const res = await $api.post('/auth/register', formData);

      onSuccess();
      setIsDialogOpen(false);
      setFormData({
        role_id: undefined,
        name: '',
        surname: '',
        birthday: '',
        phone: '',
        email: '',
        password: '',
      });
    } catch (error) {
      console.error('Chyba při přidávání zaměstnance:', error);
      alert(error.response?.data?.message || 'Něco se pokazilo.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await $api.get('/user/roles');
      setRoles(res.data);

      const defaultRole = res.data.find((r) => r.name === 'driver');
      if (defaultRole) {
        setFormData((prev) => ({
          ...prev,
          role_id: defaultRole.id,
        }));
      }
    } catch (error) {
      console.error('Chyba při načítání rolí:', error);
    }
  };

  useEffect(() => {
    if (isDialogOpen) fetchRoles();
  }, [isDialogOpen]);

  return {
    data: {
      isDialogOpen,
      isLoading,
      formData,
      roles,
      setIsDialogOpen,
      setFormData,
    },
    actions: {
      handleSave,
      handleChange,
    },
  };
};
