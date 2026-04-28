import { useState, useEffect, useRef, useCallback } from 'react';
import $api from '@/api/axiosInstance';
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
    // Базовая валидация (чтобы не отправили пустые поля)
    if (!formData.name || !formData.surname || !formData.phone) {
      alert('Vyplňte prosím všechna povinná pole (Jméno, Příjmení, Telefon).');
      return;
    }

    if (formData.role !== 'driver' && (!formData.email || !formData.password)) {
      alert('Pro administrátory a dispečery je nutné vyplnit email a heslo.');
      return;
    }

    setIsLoading(true);
    console.log(formData);
    try {
      // Отправляем POST запрос
      const res = await $api.post('/auth/register', formData);

      // Добавляем нового юзера в таблицу без перезагрузки страницы!
      onSuccess();

      // Закрываем модалку и очищаем форму для следующего раза
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

      // toast.success('Zaměstnanec byl úspěšně přidán!');
    } catch (error) {
      console.error('Chyba při přidávání zaměstnance:', error);
      alert(error.response?.data?.message || 'Něco se pokazilo.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await $api.get('/user/roles'); // Твой эндпоинт для ролей
      setRoles(res.data);

      // Автоматически выбираем роль 'driver' по умолчанию, если она есть
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
