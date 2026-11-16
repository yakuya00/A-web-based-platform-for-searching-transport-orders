import React, { useState } from 'react';
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
import {
  Truck,
  User,
  Link as LinkIcon,
  Edit,
  Trash2,
  CheckCircle2,
  Route,
  PauseCircle,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import $api from '@/api/axiosInstance';

const renderStatus = (statusName) => {
  const baseClass =
    'flex items-center gap-1.5 px-2.5 py-0.5 border-transparent font-semibold w-fit';
  switch (statusName) {
    case 'active':
      return (
        <Badge
          className={`${baseClass} bg-emerald-100 text-emerald-800 hover:bg-emerald-200`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Aktivní
        </Badge>
      );
    case 'on_trip':
      return (
        <Badge
          className={`${baseClass} bg-blue-100 text-blue-800 hover:bg-blue-200`}
        >
          <Route className="w-3.5 h-3.5" /> Na cestě
        </Badge>
      );
    case 'inactive':
      return (
        <Badge
          className={`${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}
        >
          <PauseCircle className="w-3.5 h-3.5" /> V garáži
        </Badge>
      );
    case 'maintenance':
      return (
        <Badge
          className={`${baseClass} bg-rose-100 text-rose-800 hover:bg-rose-200`}
        >
          <Wrench className="w-3.5 h-3.5" /> V servisu
        </Badge>
      );
    default:
      return (
        <Badge className={`${baseClass} bg-gray-100 text-gray-500`}>
          <HelpCircle className="w-3.5 h-3.5" /> Neznámý
        </Badge>
      );
  }
};

/**
 * Interaktivní tabulka pro správu jízdních souprav.
 * * Komponenta zajišťuje:
 * 1. Přehledné zobrazení kombinací tahačů, návěsů a přiřazených řidičů.
 * 2. Barevné rozlišení provozních stavů (Aktivní, Na cestě, V servisu).
 * 3. Modální rozhraní pro editaci názvu a stavu s dynamickou filtrací povolených přechodů.
 * 4. Bezpečnostní dialog (AlertDialog) pro potvrzení smazání soupravy.
 * @todo (Refactor) Vyčlenit editační modál do samostatné komponenty 'EditCompositionDialog'.
 * @todo (Logic) Logika editace by měla být přesunuta do vlastního hooku 'useEditComposition', aby se odlehčilo hlavní tabulce.
 * @param {Object} props
 * @param {Array} props.compositions - Pole objektů jízdních souprav načtených z API.
 * @param {Function} props.onSuccess - Callback pro aktualizaci dat v nadřazené komponentě (refresh).
 */
const CompositionsTable = ({ compositions, onSuccess }) => {
  // --- STAVY PRO EDITACI ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [dbStatuses, setDbStatuses] = useState([]);

  const statusTranslations = {
    active: 'Aktivní (připravena)',
    inactive: 'V garáži',
    maintenance: 'V servisu',
    on_trip: 'Na cestě',
  };

  const [formData, setFormData] = useState({
    name: '',
    status_name: '',
    status_id: null,
  });

  /**
   * Otevře editační modál a načte kontextuální data.
   * @async
   * @param {Object} comp - Objekt soupravy vybraný k úpravě.
   */
  const handleEditClick = async (comp) => {
    setEditingComp(comp);
    setFormData({
      name: comp.name || '',
      status_name: comp.status_name || '',
      status_id: comp.status_id || null,
    });

    try {
      const response = await $api.get(
        `/common/composition_statuses/${comp.id}`
      );
      setDbStatuses(response.data.statuses || []);
    } catch (error) {
      console.error('Chyba při načítání statusů', error);
      setDbStatuses([]);
    }

    setIsEditModalOpen(true);
  };

  /**
   * Uloží provedené změny na server.
   * @async
   */
  const handleSave = async () => {
    await $api.put(`/vehicle-composition/${editingComp.id}`, formData);
    onSuccess();
    setIsEditModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  /**
   * Provede logicke smazání soupravy z databáze.
   * @async
   * @param {number} compositionId - Unikátní identifikátor soupravy.
   */
  const deleteComposition = async (compositionId) => {
    await $api.delete(`/vehicle-composition/${compositionId}`);
    onSuccess();
  };

  // --- RENDEROVÁNÍ PRÁZDNÉHO STAVU ---
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

  // --- RENDEROVÁNÍ TABULKY ---
  return (
    <>
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
              <TableCell className="font-medium">
                {comp.name || `Souprava #${comp.id}`}
              </TableCell>

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

              <TableCell>
                {comp.trailers && comp.trailers.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {comp.trailers.map((t) => (
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

              <TableCell>{renderStatus(comp.status_name)}</TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Upravit soupravu"
                    className="h-8 w-8 text-gray-500 hover:text-blue-600"
                    onClick={() => handleEditClick(comp)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
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
                          Tato akce trvale odstraní soupravu z vaší firmy. Tuto
                          akci nelze vrátit zpět.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Zrušit</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteComposition(comp.id)}
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

      {/* --- EDITAČNÍ DIALOG --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Úprava jízdní soupravy</DialogTitle>
          </DialogHeader>

          {editingComp && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Název soupravy (nepovinné)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Např. Scania - Novák"
                />
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={formData.status_name}
                  onValueChange={(val) => {
                    const selectedStatus = dbStatuses.find(
                      (s) => s.name === val
                    );

                    setFormData((prev) => ({
                      ...prev,
                      status_name: val,
                      status_id: selectedStatus
                        ? selectedStatus.id
                        : prev.status_id,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte status" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.name}>
                        {statusTranslations[status.name] || status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Zrušit
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Uložit změny
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompositionsTable;
