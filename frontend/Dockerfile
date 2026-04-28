# frontend/Dockerfile
FROM node:21-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Порт для Vite/React/Webpack (обычно 3000 или 5173)
EXPOSE 5173

# Запуск dev-сервера (важно: сервер должен слушать 0.0.0.0, а не localhost)
CMD ["npm", "run", "dev", "--", "--host"]