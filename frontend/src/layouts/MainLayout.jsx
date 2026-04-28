import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Chat from '@/components/layout/Chat';
import FreightDrawer from '@/components/FreightDrawer';

export default function MainLayout() {
  // Стейт для открытия/закрытия чата справа
  const [isChatOpen, setIsChatOpen] = useState(true); // Можешь поставить false по умолчанию
  const [activeOrderId, setActiveOrderId] = useState(null);

  return (
    // Главный контейнер: на весь экран, без общего скролла
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      {/* 1. ЛЕВЫЙ САЙДБАР (Навигация) */}
      <Sidebar />

      {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ (Шапка + Главный контент) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. ВЕРХНИЙ НАВБАР (Шапка) */}
        <Header isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />

        {/* 3. ГЛАВНАЯ РАБОЧАЯ ЗОНА (Сюда подставляются страницы) */}
        {/* overflow-auto позволяет скроллить только таблицу, шапка стоит на месте */}
        <main className="flex-1 overflow-auto min-w-0 bg-gray-50/50 p-6">
          <Outlet />
        </main>
      </div>

      {/* 4. ПРАВЫЙ САЙДБАР (Мессенджер a.k.a Trans.eu) */}
      {isChatOpen && (
        <aside className="w-auto bg-white border-l border-gray-200 flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)] z-20 transition-all duration-300">
          {/* Шапка чата */}
          <Chat
            setIsChatOpen={setIsChatOpen}
            onOpenOrderChat={(orderId) => {
              setActiveOrderId(orderId);
              setIsChatOpen(false); // Прячем список чатов
            }}
          />
        </aside>
      )}

      <FreightDrawer
        isOpen={!!activeOrderId}
        onClose={() => setActiveOrderId(null)}
        freightId={activeOrderId}
      />
    </div>
  );
}
