import React, { useState, useEffect } from 'react';
import MyOffersTable from '@/components/myOffers/MyOffersTable';
import AssignVehicleDialog from '@/components/myOffers/AssignVehicleDialog';
import { useMyOffers } from '@/hooks/useMyOffers';
import RatingDialog from '@/components/RatingDialog';

const MyOffers = () => {
  const { data, actions } = useMyOffers();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedOrderIdForAssign, setSelectedOrderIdForAssign] =
    useState(null);
  const [ratingData, setRatingData] = useState(null);

  // Функция открытия модалки
  const handleOpenAssignDialog = (orderId) => {
    setSelectedOrderIdForAssign(orderId);
    setIsAssignDialogOpen(true);
  };

  const openRating = (orderId, targetCompanyId) => {
    console.log('Нажал');
    setRatingData({ orderId, toCompanyId: targetCompanyId });
  };

  const handleRatingSuccess = () => {
    setRatingData(null); // Закрываем модалку
    // TODO: Здесь круто было бы еще заново запросить список заказов (refetch),
    // чтобы кнопка "Ohodnotit" исчезла, раз заказ уже оценен.
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Moje nabídky
          </h1>
          <p className="text-muted-foreground mt-1">
            Přehled všech cenových nabídek odeslaných zákazníkům.
          </p>
        </div>
      </div>
      <MyOffersTable
        offers={data.offers}
        handleOpenAssignDialog={handleOpenAssignDialog}
        handleOpenRating={openRating}
      />
      <AssignVehicleDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        orderId={selectedOrderIdForAssign}
        onSuccess={actions.fetchMyOffers}
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

export default MyOffers;
