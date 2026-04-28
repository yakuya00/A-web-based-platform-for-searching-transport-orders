import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddVehicleDialog from '@/components/fleet/AddVehicleDialog'; // Путь к твоей модалке
import AddCompositionDialog from '@/components/fleet/AddCompositionDialog';
import { Truck } from 'lucide-react';
import VehiclesTable from '@/components/fleet/VehiclesTable';
import CompositionsTable from '@/components/fleet/CompositionsTable';
import { useFleet } from '@/hooks/useFleet';

export default function Fleet() {
  const { data, actions } = useFleet();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vozový park</h1>
          <p className="text-gray-500">
            Správa vozidel a sestavování jízdních souprav
          </p>
        </div>
        {/* Кнопка добавления спрятана внутри компонента */}
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
          <TabsTrigger value="vehicles">Vozidla (Železo)</TabsTrigger>
          <TabsTrigger value="compositions">
            Soupravy (Přiřazení řidiči)
          </TabsTrigger>
        </TabsList>

        {/* ВКЛАДКА 1: ПРОСТО СПИСОК МАШИН */}
        <TabsContent value="vehicles">
          <VehiclesTable vehicles={data.vehicles} />
        </TabsContent>

        {/* ВКЛАДКА 2: СЦЕПКИ (Задел на будущее) */}
        <TabsContent value="compositions">
          <CompositionsTable compositions={data.compositions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
