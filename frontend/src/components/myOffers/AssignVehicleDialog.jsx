import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Truck, User, CheckCircle2 } from 'lucide-react';
import { useAssighVehicleDialog } from '@/hooks/useAssignVehicleDialog';

const AssignVehicleDialog = ({ isOpen, onClose, orderId, onSuccess }) => {
  const { data, actions } = useAssighVehicleDialog(
    isOpen,
    orderId,
    onSuccess,
    onClose
  );
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Truck className="w-5 h-5 text-blue-600" />
            Přiřadit vozidlo k zakázce
          </DialogTitle>
          <DialogDescription>
            Vyberte jízdní soupravu a řidiče, kteří tuto zakázku odvezou. Po
            uložení se vygenerují QR kódy pro nakládku.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {data.isLoading ? (
            <div className="flex justify-center items-center py-4 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              Načítám dostupná vozidla...
            </div>
          ) : data.compositions.length === 0 ? (
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 text-sm">
              Nemáte žádná aktivní vozidla s přiřazeným řidičem. Prosím,
              přidejte je v sekci "Vozový park".
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Dostupné jízdní soupravy
              </label>
              <Select
                value={data.selectedCompositionId}
                onValueChange={data.setSelectedCompositionId}
              >
                <SelectTrigger className="w-full h-14">
                  <SelectValue placeholder="Vyberte vozidlo a řidiče" />
                </SelectTrigger>
                <SelectContent>
                  {data.compositions.map((comp) => (
                    <SelectItem
                      key={comp.composition_id}
                      value={comp.composition_id.toString()}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col py-1">
                        <span className="font-semibold text-gray-900">
                          {comp.composition_name} ({comp.truck_reg_number})
                        </span>
                        <span className="text-xs text-gray-500 flex items-center mt-0.5">
                          <User className="w-3 h-3 mr-1" />
                          Řidič: {comp.driver_name} {comp.driver_surname}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={data.isSubmitting}
          >
            Zrušit
          </Button>
          <Button
            onClick={actions.handleAssign}
            disabled={
              !data.selectedCompositionId ||
              data.isSubmitting ||
              data.compositions.length === 0
            }
            className="bg-green-600 hover:bg-green-700"
          >
            {data.isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Uložit a vygenerovat QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignVehicleDialog;
