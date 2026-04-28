import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'created':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-transparent">
          Aktivní
        </Badge>
      );
    case 'assign': // 🔥 ДОБАВИЛИ ASSIGNED (Желтый)
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent">
          Přiděleno
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent">
          V přepravě
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="outline" className="text-gray-500 bg-gray-50">
          Dokončeno
        </Badge>
      );
    case 'cancelled': // 🔥 ДОБАВИЛИ CANCELLED (Красный)
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-transparent">
          Stornováno
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const MyFreightsTable = ({
  handleDelete,
  filters = [],
  lastFreightElementRef,
  onViewOffers = null,
  handleCancel = null,
  handleOpenQRDialog = null,
  handleOpenRating = null,
}) => {
  return (
    <Table>
      <TableHeader className="bg-gray-50/50">
        <TableRow>
          <TableHead>Datum nakládky</TableHead>
          <TableHead>Trasa</TableHead>
          <TableHead>Náklad</TableHead>
          <TableHead>Cena</TableHead>
          <TableHead>Stav</TableHead>
          <TableHead className="text-right">Akce</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filters.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center text-gray-500">
              Zatím zde nemáte žádné zakázky.
            </TableCell>
          </TableRow>
        ) : (
          filters.map((freight, index) => {
            const isLastElement = filters.length === index + 1;
            return (
              <TableRow
                key={freight.id}
                ref={isLastElement ? lastFreightElementRef : null}
                className="group hover:bg-blue-50/30 cursor-default"
              >
                <TableCell className="font-medium text-gray-900">
                  {new Date(freight.loading_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-gray-900">
                    {freight.from}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    ➔ {freight.to}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">
                    {freight.weight} t
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {freight.cargo_type}
                  </div>
                </TableCell>
                <TableCell className="font-bold text-gray-900">
                  {freight.price} {freight.currency}
                </TableCell>
                <TableCell>
                  <StatusBadge status={freight.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {freight.status === 'created' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            console.log('Редактировать', freight.id)
                          }
                          className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          Upravit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(freight.id)}
                          className="h-8 text-xs bg-red-50 text-red-700 hover:bg-red-100 shadow-none"
                        >
                          Smazat
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewOffers(freight.id)} // 👈 ВЫЗЫВАЕМ ПРОКИНУТУЮ ФУНКЦИЮ
                        >
                          Zobrazit nabídky
                        </Button>
                      </>
                    )}
                    {(freight.status === 'assign' ||
                      freight.status === 'in_progress') &&
                      handleOpenQRDialog && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenQRDialog(freight.id)}
                          className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-none"
                        >
                          <QrCode className="w-3 h-3 mr-1" />
                          QR kódy
                        </Button>
                      )}

                    {freight.status === 'assign' && handleCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(freight.id)}
                        className="h-8 text-xs text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 shadow-none"
                      >
                        Stornovat
                      </Button>
                    )}
                    {freight.status === 'completed' && handleOpenRating && (
                      <Button
                        variant="outline"
                        size="sm"
                        // Заказчик оценивает Перевозчика (убедись, что с бэкенда приходит carrier_company_id)
                        onClick={() =>
                          handleOpenRating(
                            freight.id,
                            freight.carrier_company_id
                          )
                        }
                        className="h-8 text-xs bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 shadow-none"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Ohodnotit
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default MyFreightsTable;
