import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddVehicleDialog from '@/components/fleet/AddVehicleDialog';
import AddCompositionDialog from '@/components/fleet/AddCompositionDialog';
import VehiclesTable from '@/components/fleet/VehiclesTable';
import CompositionsTable from '@/components/fleet/CompositionsTable';
import { useFleet } from '@/hooks/useFleet';

/**
 * Modul pro správu vozového parku (Fleet Management).
 * * Architektura:
 * 1. Tab "Vozidla": Evidence tahačů a návěsů (technické parametry, STK, atd.).
 * 2. Tab "Soupravy": Dynamické spojování vozidel s konkrétními řidiči do operačních jednotek.
 * * Klíčové vlastnosti:
 * - Kontextové akce: Tlačítko "Přidat" se mění podle toho, ve které záložce se uživatel nachází.
 * - Data Composition: Předává seznam všech vozidel do dialogu pro tvorbu souprav pro snadné párování.
 * @todo (UX) Přidat do záhlaví tabulky vyhledávací pole (Search Bar) pro rychlé hledání podle SPZ.
 */
export default function Fleet() {
  const { data, actions } = useFleet();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vozový park</h1>
          <p className="text-gray-500 mt-1">
            Správa vozidel a sestavování jízdních souprav
          </p>
        </div>
        {data.activeTab === 'vehicles' ? (
          <AddVehicleDialog onSuccess={actions.fetchVehicles} />
        ) : (
          <AddCompositionDialog
            onSuccess={actions.fethcCompositions}
            vehicles={data.vehicles}
          />
        )}
      </div>

      <Tabs
        value={data.activeTab}
        onValueChange={data.setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="vehicles">Vozidla</TabsTrigger>
          <TabsTrigger value="compositions">
            Soupravy (Přiřazení řidiči)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <VehiclesTable
            vehicles={data.vehicles}
            onSuccess={actions.fetchVehicles}
          />
        </TabsContent>

        <TabsContent value="compositions">
          <CompositionsTable
            compositions={data.compositions}
            onSuccess={actions.fethcCompositions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
