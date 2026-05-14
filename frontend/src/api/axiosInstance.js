/**
 * Konfigurace Axios instance s automatickým managementem JWT tokenů.
 * Implementuje mechanismus "Silent Refresh" a frontu požadavků během obnovy tokenu.
 * @module api/axios
 */

import axios from 'axios';

/**
 * Hlavní instance Axios s přednastavenou bází a povolením cookies (pro Refresh Token).
 */
const instance = axios.create({
  baseURL: '/',
  withCredentials: true,
});

// Interní stav pro management obnovy tokenu
let isRefreshing = false;
let failedQueue = [];
let isRedirecting = false;

/**
 * Zpracuje frontu pozastavených požadavků po úspěšné obnově tokenu.
 * @param {Error|null} error - Chyba při obnově, pokud nastala.
 * @param {string|null} token - Nový Access Token.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor: Přidává Access Token do hlavičky každého požadavku.
 */
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response Interceptor: Řeší chyby 401 (neautorizováno) a spouští refresh mechanismus.
 */
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/login') ||
      originalRequest.url.includes('/auth/refresh-token')
    ) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._isRetry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance.request(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._isRetry = true;
      isRefreshing = true;

      try {
        const response = await axios.get('/auth/refresh-token', {
          baseURL: '/',
          withCredentials: true,
        });

        const newAccessToken = response.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance.request(originalRequest);
      } catch (e) {
        processQueue(e, null);
        localStorage.removeItem('accessToken');

        if (!isRedirecting && window.location.pathname !== '/login') {
          isRedirecting = true;
          window.location.href = '/login';
        }
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
