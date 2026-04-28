import React, { useEffect, useState } from 'react';
import $api from '@/api/axiosInstance';
import RouteMap from '@/components/RouteMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFreightDrawer } from '@/hooks/useFreightDrawer';
import OrderChat from './OrderChat'; // 🔥 Убедись, что путь правильный!
import { useAuth } from '@/context/AuthContext';

// Иконки
import { MessageSquare, CheckCircle2 } from 'lucide-react';

const getDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const FreightDrawer = ({ isOpen, onClose, freightId }) => {
  const { data, actions } = useFreightDrawer(isOpen, freightId, onClose);
  const { user } = useAuth();

  // 🔥 Наше состояние для чата
  const [showChat, setShowChat] = useState(false);

  // Сбрасываем чат при закрытии модалки
  useEffect(() => {
    if (!isOpen) setShowChat(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-1/3 bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-y-auto">
        {/* ШАПКА ПАНЕЛИ */}
        <div className="sticky top-0 bg-white z-100 px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            {showChat ? 'Chat k objednávce' : 'Detail objednávky'}
          </h2>
          <button
            onClick={() => actions.handleClose()}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* УСЛОВИЕ 1: ИДЕТ ЗАГРУЗКА */}
        {data.isLoading || !data.freight ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg
              className="animate-spin h-10 w-10 text-blue-600 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="font-medium">Načítám detaily...</p>
          </div>
        ) : /* 🔥 УСЛОВИЕ 2: ЕСЛИ showChat = true, ПОКАЗЫВАЕМ ЧАТ */
        showChat ? (
          <OrderChat freight={data.freight} onBack={() => setShowChat(false)} />
        ) : (
          /* УСЛОВИЕ 3: ИНАЧЕ ПОКАЗЫВАЕМ ОБЫЧНЫЕ ДЕТАЛИ ГРУЗА */
          <>
            <div className="p-6 flex flex-col gap-8 flex-1">
              {/* Маршрут */}
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-bl-full pointer-events-none"></div>
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-3 h-3 rounded-full bg-blue-500 shrink-0 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"></div>
                    <div>
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">
                        Nakládka • {getDate(data.freight.loading_date)}
                      </p>
                      <p className="font-bold text-gray-900 text-lg leading-tight mt-0.5">
                        {data.freight.loading_address}
                      </p>
                    </div>
                  </div>
                  <div className="w-0.5 h-6 bg-blue-200 ml-1.5 -my-2 rounded-full"></div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-3 h-3 rounded-full bg-green-500 shrink-0 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]"></div>
                    <div>
                      <p className="text-xs text-green-600 font-bold uppercase tracking-wide">
                        Vykládka • {getDate(data.freight.unloading_date)}
                      </p>
                      <p className="font-bold text-gray-900 text-lg leading-tight mt-0.5">
                        {data.freight.unloading_address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {data.freight.from_lat && data.freight.to_lat && (
                <div className="mt-4">
                  <RouteMap
                    fromLat={data.freight.from_lat}
                    fromLon={data.freight.from_lon}
                    toLat={data.freight.to_lat}
                    toLon={data.freight.to_lon}
                    price={data.freight.price}
                  />
                </div>
              )}

              {/* Параметры груза */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  📦 Informace o nákladu
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="block text-xs text-gray-500 mb-0.5">
                      Váha / Objem
                    </span>
                    <p className="font-bold text-gray-900">
                      {data.freight.weight} t / {data.freight.volume} m³
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="block text-xs text-gray-500 mb-0.5">
                      Typ vozu
                    </span>
                    <p className="font-bold text-gray-900 capitalize">
                      {data.freight.cargo_type}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="block text-xs text-gray-500 mb-0.5">
                      Délka
                    </span>
                    <p className="font-semibold text-gray-900">
                      {data.freight.length} m
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="block text-xs text-gray-500 mb-0.5">
                      Výška
                    </span>
                    <p className="font-semibold text-gray-900">
                      {data.freight.height} m
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2 flex justify-between items-center">
                    <div>
                      <span className="block text-xs text-gray-500 mb-0.5">
                        Stav nákladu
                      </span>
                      <p className="font-bold text-gray-900 capitalize">
                        {data.freight.cargo_condition}
                      </p>
                    </div>
                    <span className="text-2xl opacity-50">🛡️</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2">
                    <span className="block text-xs text-gray-500 mb-1">
                      Popis nákladu
                    </span>
                    <p className="font-medium text-gray-900">
                      {data.freight.cargo_description}
                    </p>
                  </div>
                  {data.freight.extra_info && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 col-span-2">
                      <span className="block text-xs text-amber-700 font-semibold mb-1">
                        ⚠️ Další informace
                      </span>
                      <p className="font-medium text-amber-900">
                        {data.freight.extra_info}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Финансы */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  💰 Cena a platba
                </h3>
                <div className="border border-green-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-green-50 p-5 border-b border-green-100 flex justify-between items-center">
                    <span className="font-semibold text-green-800">
                      Cena za přepravu
                    </span>
                    <span className="text-2xl font-black text-green-600">
                      {data.freight.price
                        ? `${data.freight.price} ${data.freight.currency || '€'}`
                        : 'Dohodou'}
                    </span>
                  </div>
                  <div className="flex bg-white divide-x divide-gray-100">
                    <div className="p-4 flex-1 text-center hover:bg-gray-50 transition-colors">
                      <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                        Splatnost
                      </span>
                      <span className="font-bold text-gray-900">
                        {data.freight.payment_term_days} dnů
                      </span>
                    </div>
                    <div className="p-4 flex-1 text-center hover:bg-gray-50 transition-colors">
                      <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                        Způsob platby
                      </span>
                      <span className="font-bold text-gray-900 capitalize">
                        {data.freight.payment_method}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Заказчик */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  🏢 Zadavatel
                </h3>
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {data.freight.company_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">
                      {data.freight.company_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-yellow-400 text-sm">★★★★★</span>
                      <span className="text-sm font-medium text-gray-500">
                        {data.freight.company_rating} (
                        {data.freight.company_rating_count} recenzí)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ФУТЕР С КНОПКАМИ */}
            <div className="p-6 bg-white border-t sticky bottom-0 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
              {!data.showOfferForm ? (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 text-base h-12"
                    onClick={() => data.setShowOfferForm(true)}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Podat nabídku
                  </Button>

                  {/* 🔥 КНОПКА КОТОРАЯ ОТКРЫВАЕТ ЧАТ */}
                  {user.id !== data.freight.created_by && (
                    <Button
                      variant="outline"
                      className="h-12 px-6"
                      onClick={() => setShowChat(true)}
                    >
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-2">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Vaše cena (CZK)..."
                      value={data.offerPrice}
                      onChange={(e) => data.setOfferPrice(e.target.value)}
                      className="h-12 pl-4 pr-16 text-lg font-bold"
                      autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                      {data.freight.currency}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                      onClick={actions.handleSubmitOffer}
                      disabled={!data.offerPrice || data.isSubmitting}
                    >
                      {data.isSubmitting ? 'Odesílám...' : 'Potvrdit'}
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-12"
                      onClick={() => data.setShowOfferForm(false)}
                      disabled={data.isSubmitting}
                    >
                      Zrušit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FreightDrawer;
