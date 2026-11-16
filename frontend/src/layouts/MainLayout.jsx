import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Chat from '@/components/layout/Chat';
import FreightDrawer from '@/components/FreightDrawer';

/**
 * Hlavní rozvržení (Layout) aplikace pro dispečery.
 * @todo (Mobile) Přidat logiku pro mobilní zobrazení (např. hamburger menu a absolutní pozicování Sidebar/Chat, aby nepřekážely na malém displeji).
 */
export default function MainLayout() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState(null);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Header isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
        <main className="flex-1 overflow-auto min-w-0 bg-gray-50/50 p-6">
          <Outlet />
        </main>
      </div>

      {isChatOpen && (
        <aside className="w-auto bg-white border-l border-gray-200 flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)] z-20 transition-all duration-300">
          <Chat
            setIsChatOpen={setIsChatOpen}
            onOpenOrderChat={(orderId) => {
              setActiveOrderId(orderId);
              setIsChatOpen(false);
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
