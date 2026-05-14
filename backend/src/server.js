/**
 * Hlavní spouštěcí soubor serveru.
 * Integruje HTTP server s technologií WebSockets (Socket.io) pro real-time chat.
 * @module server
 */

import debugLib from "debug";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import {
  getOrCreateChat,
  getChatMessages,
  getUserChatList,
  saveChatMessage,
} from "./modules/chat/chat.repository.js";

/**
 * Pomocné funkce pro správu portů a chyb.
 */
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

const debug = debugLib("web-platform:server");
const port = normalizePort(process.env.PORT || "5000");
app.set("port", port);

/**
 * Vytvoření HTTP serveru.
 */
const server = http.createServer(app);

/**
 * KONFIGURACE WEB SOCKETS (Real-time komunikace)
 */
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://192.168.0.101:5173",
      "https://192.168.0.101:5173",
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Uživatel připojen k WebSocketu! ID:", socket.id);

  /**
   * Událost: Připojení do konkrétního chatu.
   * Zajišťuje vytvoření místnosti (room) pro oddělenou komunikaci.
   */
  socket.on("join_chat", async ({ orderId, chatId, userId }) => {
    try {
      let currentChatId = chatId;

      if (!currentChatId) {
        currentChatId = await getOrCreateChat(orderId, userId);
      }
      const roomName = `chat_${currentChatId}`;
      socket.join(roomName);

      const history = await getChatMessages(currentChatId);

      socket.emit("chat_history", { history, chatId: currentChatId });
    } catch (error) {
      console.error("Chyba při vstupu do chatu:", error);
    }
  });

  /**
   * Událost: Odeslání zprávy.
   * Uloží zprávu do DB a v reálném čase ji přepne ostatním v místnosti.
   */
  socket.on("send_message", async (data) => {
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

      const roomName = `chat_${chatId}`;
      io.to(roomName).emit("receive_message", messageToBroadcast);

      io.emit("chats_updated");
    } catch (error) {
      console.error("Chyba při ukládání zprávy:", error);
    }
  });

  /**
   * Událost: Vyžádání seznamu chatů uživatele.
   */
  socket.on("request_chats", async ({ userId }) => {
    try {
      const chats = await getUserChatList(userId);
      socket.emit("receive_chats", chats);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Uživatel se odpojil:", socket.id);
  });
});

/**
 * SPUŠTĚNÍ SERVERU
 */
server.listen(port, "0.0.0.0");
server.on("listening", onListening);
server.on("error", onError);
