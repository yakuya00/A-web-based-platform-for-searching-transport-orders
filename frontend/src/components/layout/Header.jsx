import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, X } from 'lucide-react';

/**
 * Hlavní navigační lišta (Header) aplikace.
 * @param {Object} props
 * @param {boolean} props.isChatOpen - Aktuální stav otevření postranního panelu zpráv.
 * @param {Function} props.setIsChatOpen - Funkce pro přepnutí viditelnosti chatu.
 * @todo (Refactor) PŘEVÉST NA SHADCN UI.
 */
const Header = ({ isChatOpen, setIsChatOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shrink-0 z-10 [app-region:drag]">
      <div className="flex items-center gap-4 [app-region:no-drag]">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="p-2 rounded-full transition-colors flex items-center justify-center text-blue-600"
        >
          {!isChatOpen && <MessageSquare className="w-5 h-5" />}
        </button>

        <div className="relative">
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="h-8 w-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full cursor-pointer border-2 border-white shadow-sm hover:shadow-md transition-shadow"
          ></div>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              ></div>

              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Odhlásit se
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
