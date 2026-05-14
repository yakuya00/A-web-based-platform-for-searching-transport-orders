import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Inicializace socketu mimo komponentu zabraňuje zbytečnému re-vytváření instance při re-renderu
const socket = io('/', { autoConnect: false });

/**
 * Real-time chatovací komponenta pro konkrétní přepravní zakázku.
 * @param {Object} props
 * @param {Object} props.freight - Objekt s daty o zakázce (musí obsahovat order_id, chat_id, adresy atd.).
 * @param {Function} props.onBack - Callback pro návrat do předchozího UI (např. zavření chatu v Draweru).
 * @todo (UX) Přidat indikátor "Protistrana píše..." (typing events).
 * @todo (Feature) Přidat potvrzení o přečtení zprávy (Read receipts - "Zobrazeno").
 * @todo (Refactor) Převést na Shadcn UI
 */
const OrderChat = ({ freight, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [currentChatId, setCurrentChatId] = useState(freight.chat_id || null);

  const messagesEndRef = useRef(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    socket.connect();

    // Připojení do specifické místnosti (room) pro danou zakázku
    socket.emit('join_chat', {
      orderId: freight.order_id,
      chatId: freight.chat_id,
      userId: user.id,
    });

    // Načtení historických zpráv při prvním připojení
    socket.on('chat_history', ({ history, chatId }) => {
      setMessages(history || []);
      setCurrentChatId(chatId);
    });

    // Posluchač pro nové příchozí zprávy v reálném čase
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Úklid po odmontování komponenty (zabránění memory leaks a duplicitním zprávám)
    return () => {
      socket.off('chat_history');
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [freight.order_id, freight.chat_id, user?.id]);

  // --- AUTO-SCROLL LOGIKA ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- ODESLÁNÍ ZPRÁVY ---
  const handleSend = (e) => {
    e.preventDefault();

    if (!text.trim() || !currentChatId || !user) return;

    socket.emit('send_message', {
      chatId: currentChatId,
      senderId: user.id,
      text: text.trim(),
      senderName: user.name,
      senderSurname: user.surname,
    });

    setText('');
  };

  if (!user) return <div className="p-4 text-center">Načítání...</div>;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex items-center gap-3 shadow-sm">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-bold text-gray-900 leading-tight">
            {freight.company_name}
          </h3>
          <p className="text-xs text-blue-600 font-medium tracking-wide">
            {freight.loading_address} ➔ {freight.unloading_address}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="m-auto text-center text-gray-400 text-sm">
            Zatím tu nejsou žádné zprávy.
            <br />
            Napište jako první!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <span className="text-[10px] text-gray-400 mb-1 px-1">
                  {isMe ? 'Vy' : `${msg.sender_name} ${msg.sender_surname}`}
                </span>
                <div
                  className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border shadow-sm text-gray-900 rounded-tl-sm'}`}
                >
                  {msg.message}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.sent_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t sticky bottom-0 z-10"
      >
        <div className="relative flex items-center">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Napište zprávu..."
            className="pr-12 h-12 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700"
            disabled={!text.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderChat;
