import React from 'react';
import { Button } from '@/components/ui/button';
import { Truck, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const VehicleTypeBadge = ({ type }) => {
  switch (type) {
    case 'truck':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent">
          Tahač
        </Badge>
      );
    case 'trailer':
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-transparent">
          Návěs/Přívěs
        </Badge>
      );
    case 'van':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-transparent">
          Dodávka
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

const VehiclesTable = ({ vehicles }) => {
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
              {v.reg_number}
            </TableCell>
            <TableCell>
              <VehicleTypeBadge type={v.vehicle_type} />
            </TableCell>
            <TableCell>
              {v.brand} <span className="text-gray-500">{v.model}</span>
            </TableCell>
            <TableCell>{v.capacity > 0 ? `${v.capacity} t` : '-'}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {vehicles.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-gray-500">
              Zatím nemáte žádná vozidla. Přidejte první!
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default VehiclesTable;
