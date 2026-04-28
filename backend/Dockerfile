FROM node:18-alpine

WORKDIR /app

# Сначала копируем package.json, чтобы кэшировать установку модулей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код (хотя в dev-режиме это перекроется томом, см. ниже)
COPY . .

# Порт, на котором работает бэкенд
EXPOSE 5000

# Команда для запуска в режиме разработки (например, nodemon)
CMD ["npm", "run", "devstart"]