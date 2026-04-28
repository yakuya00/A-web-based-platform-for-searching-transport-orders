import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Сразу добавил Link для роутинга
import RoleGuard from '@/components/RoleGuard';
import Accordeon from '@/components/ui/Accordeon';

const Sidebar = () => {
  const location = useLocation();
  const [isCompanyOpen, setIsCompanyOpen] = useState(true);
  const isActive = (path) =>
    location.pathname === path
      ? 'bg-blue-50 text-blue-700 font-semibold'
      : 'text-gray-700 hover:bg-gray-100';
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Логотип */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-2xl font-black text-blue-600 tracking-tight">
          LOGIX.
        </span>
      </div>

      {/* Ссылки меню */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 text-sm font-medium text-gray-700">
        {/* <Link
          to="/"
          className={`px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${isActive('/')}`}
        >
          <span className="text-lg">📊</span> Dashboard
        </Link> */}

        {/* 2. ГРУЗЫ (Аккордеон) */}
        <Accordeon icon="📦" text="Přepravy">
          <div className="mt-1 ml-9 flex flex-col gap-1 border-l-2 border-gray-100 pl-3">
            <Link
              to="/freights/search"
              className={`px-3 py-2 rounded-lg transition-colors ${isActive('/freights/search')}`}
            >
              🔍 Hledat přepravu
            </Link>

            {/* Право публиковать грузы: Грузовладельцы и Экспедиторы */}
            <RoleGuard requireCompanyPermission="CAN_ADD_FREIGHT">
              <Link
                to="/freights/add"
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/freights/add')}`}
              >
                ➕ Přidat nabídku
              </Link>
            </RoleGuard>
          </div>
        </Accordeon>

        {/* 3. МОЯ КОМПАНИЯ (Аккордеон) */}

        <Accordeon icon="🏢" text="Moje firma">
          <div className="mt-1 ml-9 flex flex-col gap-1 border-l-2 border-gray-100 pl-3">
            <Link
              to="/my-orders"
              className={`px-3 py-2 rounded-lg transition-colors ${isActive('/my-orders')}`}
            >
              📋 Aktivní zakázky
            </Link>

            {/* Здесь будет репутационная система после завершения заказа */}
            <Link
              to="/my-offers"
              className={`px-3 py-2 rounded-lg transition-colors ${isActive('/company/history')}`}
            >
              📚 Moje nabidky
            </Link>

            {/* Модуль учета автопарка для Перевозчиков */}
            <RoleGuard requireCompanyPermission="CAN_ADD_VEHICLE">
              <Link
                to="/fleet"
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/company/fleet')}`}
              >
                🚚 Vozový park
              </Link>
            </RoleGuard>

            {/* Управление компанией - только для Админов */}
            <RoleGuard requireUserPermission="CAN_MANAGE_COMPANY">
              <Link
                to="/my-team"
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/my-team')}`}
              >
                👥 Můj tým
              </Link>
            </RoleGuard>
          </div>
        </Accordeon>
      </nav>
    </aside>
  );
};

export default Sidebar;
