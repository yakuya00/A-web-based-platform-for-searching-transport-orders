import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Truck,
  Trash2,
  Edit,
  HelpCircle,
  LinkIcon,
  Hash,
  Tag,
  Weight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

import $api from '@/api/axiosInstance';

/**
 * Komponent pro vizualizaci technického typu vozidla pomocí barevného štítku.
 * * @component
 * @param {Object} props
 * @param {'truck'|'trailer'} props.type - Interní označení typu vozidla z DB.
 */
export const VehicleTypeBadge = ({ type }) => {
  const baseClass =
    'flex items-center gap-1.5 px-2.5 py-0.5 border-transparent font-semibold w-fit';

  switch (type) {
    case 'truck':
      return (
        <Badge
          className={`${baseClass} bg-blue-100 text-blue-800 hover:bg-blue-200`}
        >
          <Truck className="w-3.5 h-3.5" /> Tahač
        </Badge>
      );
    case 'trailer':
      return (
        <Badge
          className={`${baseClass} bg-orange-100 text-orange-800 hover:bg-orange-200`}
        >
          <LinkIcon className="w-3.5 h-3.5" /> Návěs/Přívěs
        </Badge>
      );
    default:
      return (
        <Badge className={`${baseClass} bg-gray-100 text-gray-500`}>
          <HelpCircle className="w-3.5 h-3.5" /> {type || 'Neznámý'}
        </Badge>
      );
  }
};

/**
 * Tabulka pro správu jednotlivých vozidel ve flotile společnosti.
 * * Umožňuje dispečerům prohlížet technické parametry (SPZ, značka, nosnost)
 * a provádět destruktivní operace s bezpečnostním potvrzením.
 * @param {Object} props
 * @param {Array} props.vehicles - Pole objektů vozidel k zobrazení.
 * @param {Function} props.onSuccess - Callback pro osvěžení dat po smazání.
 * @returns {JSX.Element}
 */
const VehiclesTable = ({ vehicles, onSuccess }) => {
  /**
   * Provede logické odstranění vozidla z flotily.
   * @async
   * @param {number} vehicleId
   */
  const deleteVehicle = async (vehicleId) => {
    await $api.delete(`/vehicle/${vehicleId}`);
    onSuccess();
  };

  // --- STAV: ŽÁDNÁ DATA ---
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed rounded-lg text-gray-500">
        <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Vozidla se připravují
        </h3>
        <p>Zatím nemáte žádné vozidlo. Vytvořte první!</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SPZ</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Značka a Model</TableHead>
          <TableHead>Nosnost</TableHead>
          <TableHead className="text-right">Akce</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((v) => (
          <TableRow key={v.id} className="hover:bg-gray-50/50">
            <TableCell className="font-bold text-gray-900 uppercase">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" /> {v.reg_number}
              </div>
            </TableCell>
            <TableCell>
              <VehicleTypeBadge type={v.vehicle_type} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {v.brand}
                </span>{' '}
                <span className="text-gray-500">{v.model}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-gray-600">
                <Weight className="w-4 h-4 text-gray-400" />
                {v.capacity > 0 ? `${v.capacity} t` : '-'}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Jste si absolutně jisti?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Tato akce trvale odstraní vozidlo z vaší firmy. Tuto
                        akci nelze vrátit zpět.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Zrušit</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteVehicle(v.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Smazat
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default VehiclesTable;
