import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useMyTeamDialog } from '@/hooks/useMyTeamDialog';

const MyTeamDialog = ({ onSuccess }) => {
  const { data, actions } = useMyTeamDialog(onSuccess);
  return (
    <Dialog open={data.isDialogOpen} onOpenChange={data.setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Přidat zaměstnance
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nový zaměstnanec</DialogTitle>
          <DialogDescription>Vyberte roli a vyplňte údaje.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Выбор роли */}
          <div className="grid gap-2">
            <Label htmlFor="role">Role v systému</Label>
            <Select
              value={data.formData.role_id}
              onValueChange={(value) =>
                data.setFormData((prev) => ({ ...prev, role_id: value }))
              }
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Vyberte roli" />
              </SelectTrigger>
              <SelectContent>
                {data.roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {/* Красиво переводим системные имена на чешский */}
                    {role.name === 'admin'
                      ? 'Majitel / Admin'
                      : role.name === 'manager'
                        ? 'Dispečer'
                        : role.name === 'driver'
                          ? 'Řidič'
                          : role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Имя и Фамилия */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Jméno</Label>
              <Input
                id="name"
                value={data.formData.name}
                onChange={actions.handleChange}
                placeholder="Jan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="surname">Příjmení</Label>
              <Input
                id="surname"
                value={data.formData.surname}
                onChange={actions.handleChange}
                placeholder="Novák"
              />
            </div>
          </div>

          {/* Телефон (обязателен для всех) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={data.formData.phone}
                onChange={actions.handleChange}
                placeholder="+420 777 123 456"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthday">Datum narození</Label>
              <Input
                id="birthday"
                type="date"
                value={data.formData.birthday}
                onChange={actions.handleChange}
                // 🔥 UX-фишка: запрещаем выбирать дату из будущего
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email (Přihlašovací jméno)</Label>
            <Input
              id="email"
              type="email"
              value={data.formData.email}
              onChange={actions.handleChange}
              placeholder="jan@firma.cz"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Dočasné heslo</Label>
            <Input
              id="password"
              type="password"
              value={data.formData.password}
              onChange={actions.handleChange}
              placeholder="••••••••"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => data.setIsDialogOpen(false)}>
            Zrušit
          </Button>
          <Button
            onClick={actions.handleSave}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={data.isLoading}
          >
            Uložit zaměstnance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MyTeamDialog;
