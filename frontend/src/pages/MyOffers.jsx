import React, { useState, useEffect } from 'react';
import MyOffersTable from '@/components/myOffers/MyOffersTable';
import AssignVehicleDialog from '@/components/myOffers/AssignVehicleDialog';
import { useMyOffers } from '@/hooks/useMyOffers';
import RatingDialog from '@/components/RatingDialog';

/**
 * Komponenta Moje nabídky (Správa nabídek z pohledu dopravce).
 */
const MyOffers = () => {
  const { data, actions } = useMyOffers();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedOrderIdForAssign, setSelectedOrderIdForAssign] =
    useState(null);
  const [ratingData, setRatingData] = useState(null);

  const handleOpenAssignDialog = (orderId) => {
    setSelectedOrderIdForAssign(orderId);
    setIsAssignDialogOpen(true);
  };

  const openRating = (orderId, targetCompanyId) => {
    console.log('Нажал');
    setRatingData({ orderId, toCompanyId: targetCompanyId });
  };

  const handleRatingSuccess = () => {
    setRatingData(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moje nabídky</h1>
          <p className="text-gray-500 mt-1">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setRatingData(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium tracking-wider"
            >
              Zavřít &times;
            </button>
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
