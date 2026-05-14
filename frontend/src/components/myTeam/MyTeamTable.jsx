import React from 'react';
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
import { Trash2, Shield, Headset, User, HelpCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import $api from '@/api/axiosInstance';

/**
 * Komponenta pro vizualizaci úrovně oprávnění (Role).
 * @param {string} role - Technický název role z DB.
 */
const RoleBadge = ({ role }) => {
  const baseClass =
    'flex items-center gap-1.5 px-2.5 py-0.5 border-transparent font-semibold w-fit';

  switch (role) {
    case 'Admin':
      return (
        <Badge
          className={`${baseClass} bg-purple-100 text-purple-800 hover:bg-purple-200`}
        >
          <Shield className="w-3.5 h-3.5" /> Majitel / Admin
        </Badge>
      );
    case 'Manager':
      return (
        <Badge
          className={`${baseClass} bg-blue-100 text-blue-800 hover:bg-blue-200`}
        >
          <Headset className="w-3.5 h-3.5" /> Dispečer
        </Badge>
      );
    case 'Driver':
      return (
        <Badge
          className={`${baseClass} bg-green-100 text-green-800 hover:bg-green-200`}
        >
          <User className="w-3.5 h-3.5" /> Řidič
        </Badge>
      );
    default:
      return (
        <Badge className={`${baseClass} bg-gray-100 text-gray-500`}>
          <HelpCircle className="w-3.5 h-3.5" /> {role || 'Neznámá role'}
        </Badge>
      );
  }
};

/**
 * Tabulka pro správu firemního týmu (zaměstnanců).
 * * Tento komponent zobrazuje seznam všech osob registrovaných pod danou firmou.
 * Umožňuje majitelům (Adminům) spravovat lidské zdroje a odstraňovat přístupy.
 * @param {Object} props
 * @param {Array} props.employees - Pole objektů zaměstnanců načtených z API.
 * @param {Function} props.onSuccess - Callback pro osvěžení dat po smazání člena týmu.
 * @todo (Refactor) Implementovat editační mód pro změnu rolí nebo kontaktních údajů.
 * @todo (Security) Zamezit možnosti smazat sama sebe (aktuálně přihlášeného uživatele).
 */
const MyTeamTable = ({ employees, onSuccess }) => {
  /**
   * Provede trvalé odstranění uživatelského účtu z platformy.
   * @async
   * @param {number} userId
   */
  const deleteUser = async (userId) => {
    try {
      await $api.delete(`user/${userId}`);
      onSuccess();
    } catch {
      alert(`Nastala chyba pri mazani uzivatele`);
    }
  };

  if (!employees || employees.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed rounded-lg text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Váš tým je zatím prázdný
        </h3>
        <p>Zatím nemáte žádné zaměstnance. Přidejte prvního!</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead>Zaměstnanec</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Kontakt</TableHead>
          <TableHead className="text-right">Akce</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((emp) => (
          <TableRow key={emp.id} className="hover:bg-gray-50/50">
            <TableCell className="font-medium text-gray-700">
              {emp.name} {emp.surname}
            </TableCell>
            <TableCell>
              <RoleBadge role={emp.role_name} />
            </TableCell>
            <TableCell>
              <div className="text-sm text-gray-900">{emp.phone}</div>
              {emp.email && (
                <div className="text-xs text-gray-500">{emp.email}</div>
              )}
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
                        Tato akce trvale odstraní zaměstnance z vaší firmy. Tuto
                        akci nelze vrátit zpět.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Zrušit</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteUser(emp.id)}
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

export default MyTeamTable;
