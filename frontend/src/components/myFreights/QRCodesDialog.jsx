import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react'; // 🔥 Та самая библиотека
import { QrCode, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import $api from '@/api/axiosInstance';

const QRCodesDialog = ({ isOpen, onClose, orderId }) => {
  const [qrData, setQrData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      const fetchQRCodes = async () => {
        setIsLoading(true);
        try {
          const res = await $api.get(`/order/${orderId}/qr-codes`);
          setQrData(res.data);
        } catch (error) {
          console.error('Chyba při načítání QR kódů:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchQRCodes();
    } else {
      setQrData([]);
    }
  }, [isOpen, orderId]);

  // Хелпер, чтобы найти нужный токен из массива
  const getTokenByType = (type) =>
    qrData.find((qr) => qr.type === type)?.qr_token;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <QrCode className="w-5 h-5 text-blue-600" />
            QR kódy pro zakázku #{orderId}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : qrData.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              QR kódy zatím nebyly vygenerovány.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
              {/* Код для Погрузки */}
              <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4 text-blue-700 font-semibold">
                  <ArrowUpRight className="w-5 h-5" />
                  Nakládka (Pickup)
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <QRCodeSVG
                    value={getTokenByType('pickup') || 'error'}
                    size={160}
                    level="H" // Высокий уровень коррекции ошибок
                  />
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center w-40">
                  Ukažte tento kód při vyzvednutí zboží
                </p>
              </div>

              {/* Код для Выгрузки */}
              <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4 text-green-700 font-semibold">
                  <ArrowDownRight className="w-5 h-5" />
                  Vykládka (Delivery)
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <QRCodeSVG
                    value={getTokenByType('delivered') || 'error'}
                    size={160}
                    level="H"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center w-40">
                  Ukažte tento kód při doručení zboží
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodesDialog;
