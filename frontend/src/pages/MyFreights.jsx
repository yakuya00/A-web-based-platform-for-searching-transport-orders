import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 🔥 Импортируем весь арсенал shadcn
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MyFreightsTable from '@/components/myFreights/MyFreightsTable';
import { useMyFreights } from '@/hooks/useMyFreights';
import OrderOffersList from '@/components/myFreights/OrderOffersList';
import QRCodesDialog from '@/components/myFreights/QRCodesDialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import RatingDialog from '@/components/RatingDialog';

const MyFreights = () => {
  const navigate = useNavigate();
  const { data, actions } = useMyFreights();

  // 🔥 СТЕЙТЫ ДЛЯ ПАНЕЛИ СО СТАВКАМИ
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [ratingData, setRatingData] = useState(null);

  const openRating = (orderId, targetCompanyId) => {
    console.log('Нажал');
    setRatingData({ orderId, toCompanyId: targetCompanyId });
  };

  const onAccept = () => {
    setIsOffersOpen(false);
    actions.handleTabChange(data.currentTab);
  };

  // Функция для открытия панели (ее мы прокинем в таблицу)
  const handleViewOffers = (orderId) => {
    setSelectedOrderId(orderId);
    setIsOffersOpen(true);
  };

  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedOrderIdForQR, setSelectedOrderIdForQR] = useState(null);

  const handleOpenQRDialog = (orderId) => {
    setSelectedOrderIdForQR(orderId);
    setIsQRDialogOpen(true);
  };

  const handleRatingSuccess = () => {
    setRatingData(null); // Закрываем модалку
    // TODO: Здесь круто было бы еще заново запросить список заказов (refetch),
    // чтобы кнопка "Ohodnotit" исчезла, раз заказ уже оценен.
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moje zakázky</h1>
          <p className="text-gray-500 mt-1">
            Spravujte své zveřejněné náklady a sledujte jejich stav.
          </p>
        </div>
        <Button onClick={() => navigate('/freights/add')} variant="default">
          + Přidat náklad
        </Button>
      </div>

      {/* 🔥 Используем мощь shadcn Tabs */}
      <Tabs
        value={data.currentTab}
        onValueChange={actions.handleTabChange}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="active">Aktivní náklady</TabsTrigger>
          <TabsTrigger value="history">Historie (Dokončené)</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <MyFreightsTable
            handleDelete={actions.handleDelete}
            handleCancel={actions.handleCancel}
            filters={data.freights}
            lastFreightElementRef={data.lastFreightElementRef}
            onViewOffers={handleViewOffers}
            handleOpenQRDialog={handleOpenQRDialog}
          />
        </TabsContent>
        <TabsContent value="history">
          <MyFreightsTable
            handleDelete={actions.handleDelete}
            filters={data.freights}
            lastFreightElementRef={data.lastFreightElementRef}
            handleOpenRating={openRating}
          />
        </TabsContent>
      </Tabs>

      <Sheet open={isOffersOpen} onOpenChange={setIsOffersOpen}>
        <SheetContent className="w-full sm:!max-w-md md:!max-w-lg lg:!max-w-xl xl:!max-w-2xl bg-slate-50 overflow-y-auto">
          <SheetHeader className="p-6 border-b bg-white sticky top-0 z-10">
            <SheetTitle>Nabídky od dopravců</SheetTitle>
          </SheetHeader>

          <div className="p-6">
            {/* Рендерим список ставок только если есть выбранный ID */}
            {selectedOrderId && (
              <OrderOffersList orderId={selectedOrderId} onAccept={onAccept} />
            )}
          </div>
        </SheetContent>
      </Sheet>
      <QRCodesDialog
        isOpen={isQRDialogOpen}
        onClose={() => setIsQRDialogOpen(false)}
        orderId={selectedOrderIdForQR}
      />
      {ratingData && (
        // Темный полупрозрачный фон на весь экран (backdrop)
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="relative animate-in zoom-in-95 duration-200">
            {/* Кнопка закрытия модалки крестиком (если юзер передумал) */}
            <button
              onClick={() => setRatingData(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium tracking-wider"
            >
              Zavřít &times;
            </button>

            {/* САМ КОМПОНЕНТ РЕЙТИНГА */}
            <RatingDialog
              orderId={ratingData.orderId}
              toCompanyId={ratingData.toCompanyId}
              onRatingSuccess={handleRatingSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFreights;
