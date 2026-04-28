import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom'; // 🔥 Добавили навигацию
import {
  Truck,
  MapPin,
  Package,
  QrCode,
  X,
  CheckCircle2,
  ChevronRight,
  LogOut, // 🔥 Добавили иконку выхода
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDriverApp } from '@/hooks/useDriverApp';
import { useAuth } from '@/context/AuthContext'; // 🔥 Добавили наш крутой контекст

const DriverApp = () => {
  const { data, actions } = useDriverApp();

  // 🔥 Вытаскиваем функцию выхода и навигатор
  const { logout } = useAuth();
  const navigate = useNavigate();

  // 🔥 Обработчик нажатия на выход
  const handleLogout = async () => {
    await logout(); // Контекст сам почистит localStorage и стейт
    navigate('/login', { replace: true }); // Кидаем на экран логина
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-100 flex flex-col relative shadow-2xl font-sans">
      {/* 🔥 ОБНОВЛЕННАЯ ШАПКА: Добавили flex justify-between и кнопку выхода */}
      <div className="bg-blue-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg sticky top-0 z-10 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-white" />
            Moje Trasy
          </h1>
          <p className="text-slate-400 text-sm mt-1">Aplikace pro řidiče</p>
        </div>

        {/* Кнопка выхода */}
        <button
          onClick={handleLogout}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors active:scale-95"
          title="Odhlásit se"
        >
          <LogOut className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 p-4 -mt-4">
        {/* Экран списка рейсов */}
        {!data.activeScanOrder && !data.scanResult && (
          <div className="space-y-4">
            {data.isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : data.orders.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl text-center shadow-sm">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Žádné aktivní jízdy
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Zatím vám nebyla přiřazena žádná zakázka.
                </p>
              </div>
            ) : (
              data.orders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Badge
                      variant={
                        order.status_name === 'in_progress'
                          ? 'default'
                          : 'secondary'
                      }
                      className={
                        order.status_name === 'in_progress'
                          ? 'bg-blue-600 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }
                    >
                      {order.status_name === 'in_progress'
                        ? 'Na cestě'
                        : 'Čeká na naložení'}
                    </Badge>
                    <span className="text-xs font-semibold text-gray-400">
                      #{order.order_id}
                    </span>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex gap-3 items-start">
                      <div className="mt-0.5">
                        <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Nakládka •{' '}
                          {new Date(order.pickup_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {order.pickup_location}
                        </p>
                      </div>
                    </div>

                    <div className="w-0.5 h-6 bg-gray-200 ml-1.5 -my-2"></div>

                    <div className="flex gap-3 items-start">
                      <div className="mt-0.5">
                        <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-50"></div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Vykládka •{' '}
                          {new Date(order.delivery_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {order.delivery_location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl mb-4">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {order.cargo_description} ({order.weight}t)
                    </span>
                  </div>

                  <Button
                    className="w-full h-12 text-base rounded-xl bg-slate-900 hover:bg-slate-800 shadow-md transition-transform active:scale-[0.98]"
                    onClick={() => data.setActiveScanOrder(order.order_id)}
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    Skenovat QR kód
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Экран сканера */}
        {data.activeScanOrder && !data.isVerifying && !data.scanResult && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col">
            <div className="p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
              <h3 className="text-white font-medium">
                Skenování (Zakázka #{data.activeScanOrder})
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-white rounded-full bg-white/10"
                onClick={actions.closeScanner}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              <Scanner
                onScan={(detectedCodes) => {
                  if (detectedCodes && detectedCodes.length > 0) {
                    actions.handleScan(detectedCodes[0].rawValue);
                  }
                }}
                onError={(error) => console.log(error?.message)}
              />
              <div className="absolute inset-0 border-[40px] border-black/50"></div>
              <div className="absolute w-64 h-64 border-2 border-green-500 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
            </div>

            <div className="p-8 bg-black text-center">
              <p className="text-white">Namiřte kameru na QR kód skladníka</p>
            </div>
          </div>
        )}

        {/* Экран загрузки и успеха */}
        {data.isVerifying && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-lg font-medium text-gray-900">Ověřuji kód...</p>
          </div>
        )}

        {data.scanResult && !data.isVerifying && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
            <CheckCircle2 className="w-24 h-24 text-green-500 mb-6 animate-in zoom-in" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Výborně!</h2>
            <p className="text-gray-500 mb-8">{data.scanResult}</p>
            <Button
              onClick={actions.closeScanner}
              className="w-full h-14 text-lg rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              Zpět na seznam jízd
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverApp;
