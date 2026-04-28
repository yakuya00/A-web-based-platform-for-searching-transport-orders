import React, { useEffect, useState } from 'react';
import { MessageSquare, Loader2, Truck } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import OrderChat from '../OrderChat'; // 🔥 ИМПОРТИРУЕМ ЧАТ СЮДА

const socket = io('/', { autoConnect: false });

const Chat = ({ setIsChatOpen }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 🔥 ВОТ ОН, НАШ СПАСИТЕЛЬ! Стейт для открытого диалога
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    socket.connect();
    socket.emit('request_chats', { userId: user.id });

    socket.on('receive_chats', (chatsData) => {
      setChats(chatsData);
      setLoading(false);
    });

    socket.on('chats_updated', () => {
      socket.emit('request_chats', { userId: user.id });
    });

    return () => {
      socket.off('receive_chats');
      socket.off('chats_updated');
      socket.disconnect();
    };
  }, [user.id]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 🔥 ЕСЛИ ЮЗЕР КЛИКНУЛ НА ЧАТ -> ПОКАЗЫВАЕМ САМ ЧАТ (Без всяких пробросов!)
  if (activeChat) {
    return (
      <div className="h-full bg-white relative w-full sm:w-[400px] lg:w-[450px] transition-all duration-300">
        <OrderChat
          freight={{
            order_id: activeChat.order_id,
            chat_id: activeChat.chat_id,
            company_name: activeChat.company_name,
            loading_address: activeChat.loading_address,
            unloading_address: activeChat.unloading_address,
          }}
          // 🔥 Кнопка "Назад" просто сбрасывает стейт, и мы возвращаемся к списку!
          onBack={() => setActiveChat(null)}
        />
      </div>
    );
  }

  // 👇 ИНАЧЕ ПОКАЗЫВАЕМ СПИСОК ЧАТОВ 👇
  return (
    <div className="flex flex-col h-full bg-white sm:w-[300px] lg:w-[350px] duration-300">
      {/* ШАПКА */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Zprávy
        </div>
        <button
          onClick={() => setIsChatOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          &times;
        </button>
      </div>

      {/* СПИСОК ДИАЛОГОВ */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-gray-50/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-sm font-medium">Načítám zprávy...</span>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-4">
            <MessageSquare className="w-12 h-12 mb-3 text-gray-200" />
            <p className="text-sm font-medium">
              Zatím nemáte žádné aktivní konverzace.
            </p>
          </div>
        ) : (
          chats.map((chat) => {
            const isMe = chat.last_sender_id === user.id;

            return (
              <div
                key={chat.chat_id}
                // 🔥 ТУТ ПРОСТО КЛАДЕМ ЧАТ В СТЕЙТ!
                // Никаких onOpenOrderChat и ебли с родителями.
                onClick={() => setActiveChat(chat)}
                className="p-3 bg-white hover:bg-blue-50/50 rounded-xl cursor-pointer border border-gray-100 hover:border-blue-200 transition-all shadow-sm group"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors truncate pr-2">
                    {chat.company_name || 'Neznámá společnost'}
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap pt-0.5">
                    {formatTime(chat.last_message_time)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5 truncate">
                  <Truck className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">
                    {chat.loading_address?.split(',')[0]} ➔{' '}
                    {chat.unloading_address?.split(',')[0]}
                  </span>
                </div>

                <div className="text-xs text-gray-600 truncate flex gap-1">
                  {chat.last_message ? (
                    <>
                      {isMe && (
                        <span className="font-semibold text-blue-600">Vy:</span>
                      )}
                      <span className="truncate">{chat.last_message}</span>
                    </>
                  ) : (
                    <span className="italic text-gray-400">
                      Zatím žádné zprávy...
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Chat;
