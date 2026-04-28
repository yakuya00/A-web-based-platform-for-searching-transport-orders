import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Truck } from 'lucide-react';
import { useAddVehicleDialog } from '@/hooks/useAddVehicleDialog';

const AddVehicleDialog = ({ onSuccess }) => {
  const { data, actions } = useAddVehicleDialog(onSuccess);
  return (
    <Dialog open={data.isDialogOpen} onOpenChange={data.setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Přidat vozidlo
        </Button>
      </DialogTrigger>

      {/* Добавили max-h и overflow, чтобы форма скроллилась, если экран маленький */}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nové vozidlo do flotily</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* ТИП И SPZ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="vehicle_type">Typ vozidla</Label>
              <Select
                value={data.formData.vehicle_type}
                onValueChange={(v) =>
                  data.setFormData((p) => ({ ...p, vehicle_type: v }))
                }
              >
                <SelectTrigger id="vehicle_type">
                  <SelectValue placeholder="Vyberte typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Tahač</SelectItem>
                  <SelectItem value="trailer">Návěs / Přívěs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reg_number">SPZ *</Label>
              <Input
                id="reg_number"
                value={data.formData.reg_number}
                onChange={actions.handleChange}
                placeholder="1A2 3456"
                className="uppercase"
              />
            </div>
          </div>

          {/* МАРКА, МОДЕЛЬ, ГОД */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="brand">Značka *</Label>
              <Input
                id="brand"
                value={data.formData.brand}
                onChange={actions.handleChange}
                placeholder="Scania"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={data.formData.model}
                onChange={actions.handleChange}
                placeholder="R 450"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year_of_manufacture">Rok *</Label>
              <Input
                id="year_of_manufacture"
                type="number"
                value={data.formData.year_of_manufacture}
                onChange={actions.handleChange}
                placeholder="2022"
              />
            </div>
          </div>

          {/* ГАБАРИТЫ: ДЛИНА, ВЫСОТА, НОСНОСТЬ */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="length">Délka (m)</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                value={data.formData.length}
                onChange={actions.handleChange}
                placeholder="13.6"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="height">Výška (m)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={data.formData.height}
                onChange={actions.handleChange}
                placeholder="4.0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Nosnost (t)</Label>
              <Input
                id="capacity"
                type="number"
                step="0.1"
                value={data.formData.capacity}
                onChange={actions.handleChange}
                placeholder="24.0"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="volume">Objem (m³)</Label>
            <Input
              id="volume"
              type="number"
              step="0.1"
              value={data.formData.volume}
              onChange={actions.handleChange}
              placeholder="90.0"
            />
          </div>

          {/* ЗАМЕТКИ */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Poznámky (nepovinné)</Label>
            <Textarea
              id="notes"
              value={data.formData.notes}
              onChange={actions.handleChange}
              placeholder="Např. Nutný servis brzd, Nová plachta..."
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => data.setIsDialogOpen(false)}
            disabled={data.isLoading}
          >
            Zrušit
          </Button>
          <Button
            onClick={actions.handleSave}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={data.isLoading}
          >
            {data.isLoading ? 'Ukládám...' : 'Uložit vozidlo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog;
