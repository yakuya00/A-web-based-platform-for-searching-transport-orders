import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import $api from '@/api/axiosInstance';

/**
 * Hook pro globální správu stavu multi-step registrace firmy a administrátora.
 * @todo (UX) Nahradit nativní 'alert' Toast notifikací.
 */
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
      company_name: formData.companyName,
      company_role_id: formData.companyRoleId,

      identifiers: [
        {
          identifier_type_id: 1,
          identifier_value: formData.companyIdentifier,
        },
      ],

      addresses: [
        {
          address_type_id: 1,
          nominatium_data: formData.nominatium_data,
        },
      ],

      name: formData.userName,
      surname: formData.userSurname,
      email: formData.email,
      password: formData.password,
      role_id: 1,

      phone: formData.phone || '+000000000',
      birthday: formData.birthday,
    };

    return payload;
  };

  const handleFinalSubmit = async (finalData) => {
    const basePayload = createPayload();
    const payload = { ...basePayload, ...finalData };

    try {
      const res = await $api.post('/auth/full-registration', payload);
      alert('Registrace proběhla úspěšně! Můžete se přihlásit.');
      navigate('/login');
    } catch (e) {
      console.error('[REGISTRACE] Chyba:', err);

      const serverMessage = err.response?.data?.message || '';
      const status = err.response?.status;

      if (status === 409 || serverMessage.toLowerCase().includes('email')) {
        updateUserErrors({
          email: serverMessage || 'Tento email je již registrován.',
        });
      } else if (serverMessage.toLowerCase().includes('password')) {
        updateUserErrors({ password: serverMessage });
      } else {
        alert(
          `Chyba registrace: ${serverMessage || 'Zkuste to prosím znovu.'}`
        );
      }
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
