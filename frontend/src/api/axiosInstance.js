import axios from 'axios';

const instance = axios.create({
  baseURL: '/',
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/login')
    ) {
      throw error;
    }

    if (
      error.response?.status === 401 &&
      error.config &&
      !error.config._isRetry
    ) {
      originalRequest._isRetry = true; // Ставим метку "мы уже пробовали"

      try {
        // Пытаемся обновить токен!
        // Шлем запрос на твой эндпоинт рефреша
        // Кука с Refresh токеном улетит сама благодаря withCredentials: true
        const response = await axios.get('/auth/refresh-token', {
          baseURL: '/',
          withCredentials: true,
        });

        // Если сервер ответил ОК и прислал новый Access Token:
        const newAccessToken = response.data.accessToken;

        // 1. Сохраняем его
        localStorage.setItem('accessToken', newAccessToken);

        // 2. Вставляем новый токен в заголовок старого (упавшего) запроса
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 3. Повторяем оригинальный запрос
        return instance.request(originalRequest);
      } catch (e) {
        console.log('НЕ АВТОРИЗОВАН (Refresh токен тоже протух)');
        // Если даже рефреш не сработал — всё, выкидываем юзера
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    throw error;
  }
);

export default instance;
