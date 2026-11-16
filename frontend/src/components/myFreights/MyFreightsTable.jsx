import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  QrCode,
  Star,
  Search,
  UserCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Trash2,
  List,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * Interní komponenta pro vizuální odlišení stavu zakázky.
 */
const StatusBadge = ({ status }) => {
  const baseClass =
    'flex items-center gap-1.5 px-2.5 py-0.5 border-transparent font-semibold';

  switch (status) {
    case 'created':
      return (
        <Badge
          className={`${baseClass} bg-blue-100 text-blue-800 hover:bg-blue-200`}
        >
          <Search className="w-3.5 h-3.5" /> Aktivní
        </Badge>
      );
    case 'assign':
      return (
        <Badge
          className={`${baseClass} bg-amber-100 text-amber-800 hover:bg-amber-200`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Přiděleno
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge
          className={`${baseClass} bg-indigo-100 text-indigo-800 hover:bg-indigo-200`}
        >
          <Truck className="w-3.5 h-3.5" /> V přepravě
        </Badge>
      );
    case 'completed':
      return (
        <Badge
          className={`${baseClass} bg-emerald-100 text-emerald-800 hover:bg-emerald-200`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Dokončeno
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          className={`${baseClass} bg-red-100 text-red-800 hover:bg-red-200`}
        >
          <XCircle className="w-3.5 h-3.5" /> Stornováno
        </Badge>
      );
    default:
      return (
        <Badge className={`${baseClass} bg-gray-100 text-gray-500`}>
          {status}
        </Badge>
      );
  }
};

/**
 * Tabulka pro správu vlastních zakázek (Odesílatel / Sklad).
 * * Komponenta řeší kompletní životní cyklus zakázky z pohledu zadavatele:
 * 1. Fáze 'created': Možnost prohlížet nabídky dopravců nebo zakázku smazat.
 * 2. Fáze 'assign/in_progress': Správa potvrzení pomocí QR kódů nebo možnost storna.
 * 3. Fáze 'completed': Možnost udělení hodnocení dopravci (Reputační systém).
 * @param {Object} props
 * @param {Array} props.filters - Seznam zakázek k zobrazení (přejmenovat na 'freights' pro čistotu).
 * @param {Function} props.handleDelete - Odstranění vytvořené nabídky.
 * @param {Function} props.onViewOffers - Přechod na seznam nabídek od dopravců.
 * @param {Function} props.handleOpenQRDialog - Otevření rozhraní pro verifikaci nakládky/vykládky.
 * @param {Function} props.handleOpenRating - Otevření formuláře pro hodnocení.
 * @todo (Cleanup) Přejmenovat prop 'filters' na 'freights', aby název odpovídal obsahu.
 */
const MyFreightsTable = ({
  handleDelete,
  filters = [],
  lastFreightElementRef,
  onViewOffers = null,
  handleCancel = null,
  handleOpenQRDialog = null,
  handleOpenRating = null,
}) => {
  if (!filters || filters.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed rounded-lg text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Seznam zakázek je prázdný
        </h3>
        <p>
          Zatím zde nemáte žádné zakázky. Jakmile se nějaké objeví, uvidíte je
          přímo tady.
        </p>
      </div>
    );
  }

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
                  <div className="flex justify-end gap-2 transition-opacity">
                    {freight.status === 'created' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Zobrazit nabídky"
                          onClick={() => onViewOffers(freight.id)}
                          className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Smazat náklad"
                              className="h-8 w-8 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Jste si absolutně jisti?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tato akce trvale smaze zakazku. Tuto akci nelze
                                vrátit zpět.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Zrušit</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(freight.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Smazat
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}

                    {(freight.status === 'assign' ||
                      freight.status === 'in_progress') &&
                      handleOpenQRDialog && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Zobrazit QR kódy"
                          onClick={() => handleOpenQRDialog(freight.id)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                      )}
                    {freight.status === 'assign' && handleCancel && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Stornovat náklad"
                            className="h-8 w-8 text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Jste si absolutně jisti?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Opravdu chcete stornovat náklad? Tuto akci nelze
                              vrátit zpět.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Stornovat</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancel(freight.id)}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              Smazat
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {freight.status === 'completed' && handleOpenRating && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Ohodnotit dopravce"
                        onClick={() =>
                          handleOpenRating(
                            freight.id,
                            freight.carrier_company_id
                          )
                        }
                        className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                      >
                        <Star className="w-4 h-4" />
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
