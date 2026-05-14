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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Link as LinkIcon, X } from 'lucide-react';
import { Description } from '@mui/icons-material';
import { useAddCompositionDialog } from '@/hooks/useAddCompositionDialog';

/**
 * Dialogové okno pro vytvoření nové jízdní soupravy.
 * * Tento komponent umožňuje dispečerovi sestavit soupravu (tahač + návěsy)
 * a přiřadit k ní řidiče. Obsahuje pokročilou logiku pro dynamické přidávání
 * a odebírání návěsů a zabraňuje výběru stejného vozidla do více slotů najednou.
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback funkce volaná po úspěšném uložení soupravy (obvykle refresh dat).
 * @param {Array} props.vehicles - Kompletní seznam vozidel firmy.
 * @returns {JSX.Element}
 */
const AddCompositionDialog = ({ onSuccess, vehicles }) => {
  /**
   * Využití vlastního hooku pro oddělení logiky od UI.
   * @see hooks/useAddCompositionDialog
   */
  const { data, actions } = useAddCompositionDialog(onSuccess, vehicles);

  return (
    <Dialog open={data.isDialogOpen} onOpenChange={data.setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <LinkIcon className="w-4 h-4 mr-2" />
          Vytvořit soupravu
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nová jízdní souprava</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Název soupravy (nepovinné)</Label>
            <Input
              id="name"
              value={data.formData.name}
              onChange={actions.handleChange}
              placeholder="Např. Scania - Novák"
            />
          </div>

          <div className="grid gap-2">
            <Label>Řidič</Label>
            <Select
              value={data.formData.driver_id}
              onValueChange={(val) =>
                data.setFormData((p) => ({ ...p, driver_id: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte řidiče" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-gray-500 italic">
                  -- Bez řidiče (Zůstane v garáži) --
                </SelectItem>
                {data.drivers.map((driver) => {
                  return (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} {driver.surname}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Tahač (Truck)</Label>
            <Select
              value={data.formData.truck_id}
              onValueChange={(val) =>
                data.setFormData((p) => ({ ...p, truck_id: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte tahač" />
              </SelectTrigger>
              <SelectContent>
                {data.availableTrucks.map((truck) => {
                  return (
                    <SelectItem key={truck.id} value={truck.id}>
                      {truck.reg_number} ({truck.brand} {truck.model})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
            <Label className="text-gray-700">
              Přípojná vozidla (Návěsy/Přívěsy)
            </Label>

            {data.formData.trailers.map((trailerId, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400">
                  {index + 1}.
                </span>
                <Select
                  value={trailerId}
                  onValueChange={(val) => actions.updateTrailer(index, val)}
                >
                  <SelectTrigger className="flex-1 bg-white">
                    <SelectValue placeholder="Vyberte návěs" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.availableTrailers
                      .filter((trailer) => {
                        /**
                         * LOGIKA FILTRACE:
                         * Zobrazujeme pouze návěsy, které ještě nejsou vybrány
                         * v jiném slotu této soupravy, nebo ten, který je vybrán v tomto slotu.
                         */
                        const usedTrailers = data.formData.trailers.map(String);
                        const currentTrailerId = trailer.id.toString();
                        const isUsed = usedTrailers.includes(currentTrailerId);
                        const isCurrentSlot =
                          currentTrailerId === String(trailerId);
                        return !isUsed || isCurrentSlot;
                      })
                      .map((trailer) => (
                        <SelectItem
                          key={trailer.id}
                          value={trailer.id.toString()}
                        >
                          {trailer.reg_number} ({trailer.brand} {trailer.model})
                        </SelectItem>
                      ))}

                    {/* Fallback pokud jsou všechny návěsy již přiřazeny */}
                    {data.availableTrailers.length > 0 &&
                      data.availableTrailers.filter(
                        (t) =>
                          !data.formData.trailers
                            .map(String)
                            .includes(t.id.toString()) ||
                          t.id.toString() === String(trailerId)
                      ).length === 0 && (
                        <SelectItem value="none" disabled>
                          Žádné další volné návěsy
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => actions.removeTrailerSlot(index)}
                  className="text-red-500 hover:bg-red-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={actions.addTrailerSlot}
              className="w-full mt-2 border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Připojit další vozidlo
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => data.setIsDialogOpen(false)}>
            Zrušit
          </Button>
          <Button
            onClick={actions.handleSave}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Uložit soupravu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompositionDialog;
