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
import { Truck, User, Link as LinkIcon, Edit, Trash2 } from 'lucide-react';

const CompositionsTable = ({ compositions }) => {
  // 🔥 Умный рендер статусов с цветами
  const renderStatus = (statusName) => {
    switch (statusName) {
      case 'active':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Aktivní</Badge>
        );
      case 'on_trip':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            Na cestě
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary" className="text-gray-500">
            V garáži
          </Badge>
        );
      case 'maintenance':
        return <Badge variant="destructive">V servisu</Badge>;
      default:
        return <Badge variant="outline">Neznámý</Badge>;
    }
  };

  if (!compositions || compositions.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed rounded-lg text-gray-500">
        <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Jízdní soupravy se připravují
        </h3>
        <p>Zatím nemáte žádné aktivní soupravy. Vytvořte první!</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Název soupravy</TableHead>
          <TableHead>Tahač / Nákladní auto</TableHead>
          <TableHead>Návěsy / Přívěsy</TableHead>
          <TableHead>Řidič</TableHead>
          <TableHead>Stav</TableHead>
          <TableHead className="text-right">Akce</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {compositions.map((comp) => (
          <TableRow key={comp.id}>
            {/* НАЗВАНИЕ */}
            <TableCell className="font-medium">
              {comp.name || `Souprava #${comp.id}`}
            </TableCell>

            {/* ТЯГАЧ */}
            <TableCell>
              {comp.truck ? (
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span>
                    {comp.truck.reg_number} ({comp.truck.brand})
                  </span>
                </div>
              ) : (
                <span className="text-red-400">Chybí tahač</span>
              )}
            </TableCell>

            {/* ПРИЦЕПЫ (Может быть несколько) */}
            <TableCell>
              {comp.trailers && comp.trailers.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {comp.trailers.map((t, index) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>
                        {t.reg_number} ({t.brand})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 italic">Bez návěsu</span>
              )}
            </TableCell>

            {/* ВОДИТЕЛЬ */}
            <TableCell>
              {comp.driver ? (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span>
                    {comp.driver.name} {comp.driver.surname}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 italic">Bez řidiče</span>
              )}
            </TableCell>

            {/* СТАТУС */}
            <TableCell>{renderStatus(comp.status_name)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Upravit soupravu"
                  className="h-8 w-8 text-gray-500 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Smazat soupravu"
                  className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CompositionsTable;
