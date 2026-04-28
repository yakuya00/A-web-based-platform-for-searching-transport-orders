import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 🔥 Добавили useNavigate
import { useAuth } from '@/context/AuthContext';

const Header = ({ isChatOpen, setIsChatOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate(); // 🔥 Инициализируем навигацию
  const { logout } = useAuth();

  // 🔥 Наша функция выхода
  const handleLogout = () => {
    logout();
    navigate('/login'); // Редирект на логин
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shrink-0 z-10 [app-region:drag]">
      <div className="flex items-center gap-4 [app-region:no-drag]">
        {/* УВЕДОМЛЕНИЯ */}
        {/* <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button> */}

        {/* КНОПКА ОТКРЫТИЯ/ЗАКРЫТИЯ ЧАТА */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-2 rounded-full transition-colors ${
            isChatOpen
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          💬
        </button>

        {/* 🔥 ПРОФИЛЬ С ВЫПАДАЮЩИМ МЕНЮ */}
        <div className="relative">
          {/* Сама аватарка, по клику меняем стейт */}
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="h-8 w-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full cursor-pointer border-2 border-white shadow-sm hover:shadow-md transition-shadow"
          ></div>

          {/* Само меню (показывается только если isProfileOpen === true) */}
          {isProfileOpen && (
            <>
              {/* Невидимый слой на весь экран, чтобы закрывать меню при клике мимо */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              ></div>

              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    Můj profil
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Nastavení účtu
                  </p>
                </div>

                {/* Сюда потом можешь добавить ссылки на настройки профиля */}

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
