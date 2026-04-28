import debugLib from "debug";
import http from "http";
import app from "./app.js";

// 🔥 1. Импортируем Socket.io
import { Server } from "socket.io";

// 🔥 2. Импортируем твои функции для работы с БД (УТОЧНИ ПУТЬ к файлу!)
import {
  getOrCreateChat,
  getChatMessages,
  getUserChatList,
  saveChatMessage,
} from "./modules/chat/chat.repository.js";

const debug = debugLib("web-platform:server");
const port = normalizePort(process.env.PORT || "5000");
app.set("port", port);

// Создаем HTTP сервер
const server = http.createServer(app);

// ==========================================================
// 🔥 3. НАСТРОЙКА WEB SOCKETS (ЧАТ)
// ==========================================================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://192.168.0.101:5173",
      "https://192.168.0.101:5173", // На всякий случай разрешаем и HTTPS для телефона
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Пользователь подключился к сокетам! ID:", socket.id);

  // Клиент заходит в комнату заказа
  socket.on("join_chat", async ({ orderId, chatId, userId }) => {
    try {
      let currentChatId = chatId;

      // Если chatId нет (водитель впервые нажал "Написать" в доске грузов)
      if (!currentChatId) {
        // Ищем/создаем чат для этого заказа и ЭТОГО водителя
        currentChatId = await getOrCreateChat(orderId, userId);
      }

      // 💥 ГЛАВНОЕ: Комната теперь уникальна для каждого чата!
      const roomName = `chat_${currentChatId}`;
      socket.join(roomName);
      console.log(`Пользователь зашел в 1-на-1 комнату: ${roomName}`);

      const history = await getChatMessages(currentChatId);
      console.log(history);

      // Отправляем историю И возвращаем актуальный chatId на фронт
      socket.emit("chat_history", { history, chatId: currentChatId });
    } catch (error) {
      console.error("Ошибка при входе в чат:", error);
    }
  });

  // Клиент отправляет сообщение
  socket.on("send_message", async (data) => {
    // 🔥 Теперь фронт обязан присылать точный chatId
    const { chatId, senderId, text, senderName, senderSurname } = data;

    try {
      const savedMsg = await saveChatMessage(chatId, senderId, text);

      const messageToBroadcast = {
        id: savedMsg.id,
        message: savedMsg.message,
        sent_at: savedMsg.sent_at,
        sender_id: savedMsg.sender_id,
        sender_name: senderName,
        sender_surname: senderSurname,
      };

      // 💥 Рассылаем сообщение ТОЛЬКО в эту уникальную комнату
      const roomName = `chat_${chatId}`;
      io.to(roomName).emit("receive_message", messageToBroadcast);

      // И дергаем обновление списка чатов (как мы делали в прошлом шаге)
      io.emit("chats_updated");
    } catch (error) {
      console.error("Ошибка при сохранении сообщения:", error);
    }
  });

  socket.on("request_chats", async ({ userId }) => {
    try {
      // Здесь делаешь запрос в БД, который раньше был в роуте GET /chat/chats
      const chats = await getUserChatList(userId);

      // Отправляем список обратно ИМЕННО этому юзеру
      socket.emit("receive_chats", chats);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Пользователь отключился:", socket.id);
  });
});
// ==========================================================

// Запуск сервера
server.listen(port, "0.0.0.0");
server.on("listening", onListening);
server.on("error", onError);

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== "listen") throw error;
  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
