import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// 💡 1. Красивые бейджики для ролей (RBAC)
const RoleBadge = ({ role }) => {
  switch (role) {
    case 'admin':
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-transparent">
          Majitel / Admin
        </Badge>
      );
    case 'manager':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent">
          Dispečer
        </Badge>
      );
    case 'driver':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-transparent">
          Řidič
        </Badge>
      );
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

const MyTeamTable = ({ employees }) => {
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
            <TableCell className="font-medium">
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

        {employees.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center text-gray-500">
              Zatím nemáte žádné zaměstnance.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default MyTeamTable;
