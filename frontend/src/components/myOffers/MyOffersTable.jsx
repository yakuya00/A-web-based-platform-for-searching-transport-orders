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
import {
  Package,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Truck,
  Flag,
  Star,
  Ban,
  Search,
} from 'lucide-react';

const renderStatusBadge = (status) => {
  const baseClass =
    'flex items-center gap-1.5 px-2.5 py-0.5 border-transparent font-semibold';

  switch (status) {
    case 'pending':
      return (
        <Badge
          className={`${baseClass} bg-amber-100 text-amber-800 hover:bg-amber-200`}
        >
          <Clock className="w-3.5 h-3.5" /> Čeká na vyjádření
        </Badge>
      );
    case 'accepted':
      return (
        <Badge
          className={`${baseClass} bg-green-100 text-green-800 hover:bg-green-200`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Přijato
        </Badge>
      );
    case 'rejected':
      return (
        <Badge
          className={`${baseClass} bg-red-100 text-red-800 hover:bg-red-200`}
        >
          <XCircle className="w-3.5 h-3.5" /> Zamítnuto
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          className={`${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}
        >
          <Ban className="w-3.5 h-3.5" /> Stornováno
        </Badge>
      );
    default:
      return (
        <Badge className={`${baseClass} bg-gray-100 text-gray-500`}>
          Neznámý
        </Badge>
      );
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Tabulka odeslaných nabídek (Dopravce).
 * * Tento komponent spravuje životní cyklus nabídek, které dopravce odeslal na burzu:
 * 1. Fáze 'pending': Nabídka je odeslána a čeká se na reakci odesílatele.
 * 2. Fáze 'accepted' (bez vozidla): Odesílatel přijal cenu, dispečer musí přiřadit auto.
 * 3. Fáze 'accepted' (přiřazeno): Zakázka je připravena k realizaci, čeká se na nakládku.
 * 4. Fáze 'in_progress': Řidič naskenoval QR kód nakládky a je na cestě.
 * 5. Fáze 'completed': Přeprava je u konce, možnost ohodnotit odesílatele.
 * @param {Object} props
 * @param {Array} props.offers - Pole objektů nabídek načtených z API.
 * @param {Function} props.handleOpenAssignDialog - Otevře dialog pro výběr vozidla a řidiče.
 * @param {Function} [props.handleOpenRating] - Otevře dialog pro hodnocení protistrany (odesílatele).
 */
const MyOffersTable = ({
  offers,
  handleOpenAssignDialog,
  handleOpenRating = null,
}) => {
  if (!offers || offers.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed rounded-lg text-gray-500">
        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Žádné odeslané nabídky
        </h3>
        <p>
          Zatím nemáte žádné odeslané nabídky. Běžte na burzu a ulovte nějakou
          zakázku!
        </p>
      </div>
    );
  }

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
            <TableCell>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="truncate max-w-[200px]">
                  {offer.cargo_description}
                </span>
              </div>
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <Wallet className="w-4 h-4 text-green-600" />
                {offer.proposed_price.toLocaleString('cs-CZ')} {offer.currency}
              </div>
            </TableCell>

            <TableCell>{renderStatusBadge(offer.offer_status)}</TableCell>

            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                {offer.offer_status === 'accepted' &&
                  (offer.vehicle_composition_id ? (
                    <div className="flex items-center">
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

                      {offer.order_status_name === 'in_progress' && (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm border-transparent">
                          <Truck className="w-3 h-3 mr-1" /> Na cestě
                        </Badge>
                      )}

                      {offer.order_status_name === 'completed' && (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-600 border-gray-300"
                          >
                            <Flag className="w-3 h-3 mr-1" /> Dokončeno
                          </Badge>

                          {handleOpenRating && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Ohodnotit odesilatele"
                              onClick={() =>
                                handleOpenRating(
                                  offer.order_id,
                                  offer.company_id
                                )
                              }
                              className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleOpenAssignDialog(offer.order_id)}
                    >
                      Přiřadit vozidlo
                    </Button>
                  ))}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MyOffersTable;
