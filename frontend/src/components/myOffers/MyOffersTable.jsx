import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// 🔥 Объединил все иконки в один аккуратный импорт
import {
  MapPin,
  Package,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  Truck,
  Flag,
  Star,
} from 'lucide-react';

// Это рендер статуса самой СТАВКИ (Тендера)
const renderStatusBadge = (status) => {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          <Clock className="w-3 h-3 mr-1" /> Čeká na vyjádření
        </Badge>
      );
    case 'accepted':
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Přijato
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" /> Zamítnuto
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-500 border-gray-200"
        >
          <XCircle className="w-3 h-3 mr-1" /> Zakázka stornována
        </Badge>
      );
    default:
      return <Badge variant="secondary">Neznámý</Badge>;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const MyOffersTable = ({
  offers,
  handleOpenAssignDialog,
  handleOpenRating = null,
}) => {
  console.log(offers);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trasa a Datum</TableHead>
          <TableHead>Náklad</TableHead>
          <TableHead>Moje cena</TableHead>
          <TableHead>Stav</TableHead>
          <TableHead className="text-right">Akce</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {offers.map((offer) => (
          <TableRow
            key={offer.id}
            className="hover:bg-gray-50/50 transition-colors"
          >
            {/* ТРАССА */}
            <TableCell>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-semibold text-gray-900">
                  <span
                    className="truncate max-w-[120px]"
                    title={offer.pickup_location}
                  >
                    {offer.pickup_location.split(',')[0]}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  <span
                    className="truncate max-w-[120px]"
                    title={offer.delivery_location}
                  >
                    {offer.delivery_location.split(',')[0]}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  Nakládka: {formatDate(offer.pickup_date)}
                </span>
              </div>
            </TableCell>

            {/* ГРУЗ */}
            <TableCell>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="truncate max-w-[200px]">
                  {offer.cargo_description}
                </span>
              </div>
            </TableCell>

            {/* ЦЕНА */}
            <TableCell>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <Wallet className="w-4 h-4 text-green-600" />
                {offer.proposed_price.toLocaleString('cs-CZ')} {offer.currency}
              </div>
            </TableCell>

            {/* СТАТУС СТАВКИ */}
            <TableCell>{renderStatusBadge(offer.offer_status)}</TableCell>

            {/* КНОПКИ И СТАТУС ЗАКАЗА */}
            <TableCell className="text-right flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Detail
              </Button>

              {/* 🔥 ЛОГИКА ОТОБРАЖЕНИЯ СТАТУСА МАШИНЫ */}
              {offer.offer_status === 'accepted' &&
                (offer.vehicle_composition_id ? (
                  <div className="flex items-center">
                    {/* Если только назначили (или если статус с бэка пустой для подстраховки) */}
                    {(!offer.order_status_name ||
                      offer.order_status_name === 'assign') && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Vozidlo
                        přiřazeno
                      </Badge>
                    )}

                    {/* Водитель отсканировал погрузку */}
                    {offer.order_status_name === 'in_progress' && (
                      <Badge className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm border-transparent">
                        <Truck className="w-3 h-3 mr-1" /> Na cestě
                      </Badge>
                    )}

                    {/* Водитель отсканировал выгрузку */}
                    {offer.order_status_name === 'completed' && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-600 border-gray-300"
                        >
                          <Flag className="w-3 h-3 mr-1" /> Dokončeno
                        </Badge>

                        {/* 🔥 ДОБАВЛЯЕМ КНОПКУ РЕЙТИНГА ДЛЯ ПЕРЕВОЗЧИКА */}
                        {handleOpenRating && (
                          <Button
                            variant="outline"
                            size="sm"
                            // Перевозчик оценивает Заказчика (offer.company_id)
                            onClick={() =>
                              handleOpenRating(offer.order_id, offer.company_id)
                            }
                            className="h-7 px-2 text-xs bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                          >
                            <Star className="w-3 h-3 mr-1" /> Ohodnotit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Если машина ЕЩЕ НЕ назначена
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleOpenAssignDialog(offer.order_id)}
                  >
                    Přiřadit vozidlo
                  </Button>
                ))}
            </TableCell>
          </TableRow>
        ))}

        {offers.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="h-32 text-center text-muted-foreground"
            >
              Zatím nemáte žádné odeslané nabídky. Běžte na burzu a ulovte
              nějakou zakázku!
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default MyOffersTable;
