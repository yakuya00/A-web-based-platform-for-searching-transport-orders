import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    companyRoleId: undefined,
    companyIdentifier: '',
    companyAddress: '',

    nominatium_data: null,

    userName: '',
    userSurname: '',
    birthday: '',
    phone: '',
    email: '',
    password: '',
  });

  const [companyErrors, setCompanyErrors] = useState({
    companyName: '',
    companyIdentifier: '',
    nominatium_data: '',
  });

  const [userErrors, setUserErrors] = useState({
    userName: '',
    userSurname: '',
    birthday: '',
    phone: '',
    email: '',
    password: '',
  });

  // Функция для обновления части данных (merging)
  const updateData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setCompanyErrors((prev) => ({
      ...prev,
      ...Object.keys(fields).reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
    }));
    setUserErrors((prev) => ({
      ...prev,
      ...Object.keys(fields).reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
    }));
  };

  const updateUserErrors = (fields) => {
    setUserErrors((prev) => ({ ...prev, ...fields }));
  };

  const createPayload = () => {
    const payload = {
      // --- ДАННЫЕ КОМПАНИИ ---
      company_name: formData.companyName,
      company_role_id: formData.companyRoleId,

      identifiers: [
        {
          identifier_type_id: 1, // ID типа "ИНН/IČO" в твоей БД
          identifier_value: formData.companyIdentifier,
        },
      ],

      addresses: [
        {
          address_type_id: 1, // ID типа "Юридический адрес"
          nominatium_data: formData.nominatium_data, // Тот самый объект из OSM
        },
      ],

      // --- ДАННЫЕ АДМИНА ---
      name: formData.userName,
      surname: formData.userSurname,
      email: formData.email,
      password: formData.password,
      role_id: 1, // ID роли "Админ компании" (проверь в БД)

      // Заглушки, если полей нет в форме (бекенд их ждет)
      phone: formData.phone || '+000000000',
      birthday: formData.birthday,
    };

    return payload;
  };

  // 🔥 Добавили аргумент finalData (данные с последнего шага)
  const handleFinalSubmit = async (finalData) => {
    // 🔥 Склеиваем то, что уже было в стейте, с тем, что пришло прямо сейчас
    const basePayload = createPayload();
    console.log(basePayload);
    const payload = { ...basePayload, ...finalData };

    console.log('ОТПРАВКА НА БЭКЕНД:', payload); // Теперь тут 100% будут все данные!

    try {
      const res = await fetch('http://localhost:5000/auth/full-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('Регистрация успешна! (Проверь консоль)');
        navigate('/login');
      } else {
        const err = await res.json();
        if (res.status === 409 || err.message.toLowerCase().includes('email')) {
          updateUserErrors({ email: err.message });
        } else if (err.message.toLowerCase().includes('password')) {
          updateUserErrors({ password: err.message });
        } else {
          alert('Ошибка: ' + err.message);
        }
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка сети');
    }
  };

  return {
    data: {
      formData,
      companyErrors,
      userErrors,
      setCompanyErrors,
      setUserErrors,
    },
    actions: {
      handleFinalSubmit,
      updateData,
      updateUserErrors,
    },
  };
};
