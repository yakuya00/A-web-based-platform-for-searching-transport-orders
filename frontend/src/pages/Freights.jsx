import React, { useState } from 'react';
import FreightDrawer from '@/components/FreightDrawer';
import FreightsMap from '@/components/FreightsMap';
import FreightsHeader from '@/components/freights/FreightsHeader';
import FreightsTable from '@/components/freights/FreightsTable';
import FreightsFilters from '@/components/freights/FreightsFilters';
import { useFreights } from '@/hooks/useFreights';

const Freights = () => {
  const { filters, data, actions } = useFreights();

  // Стейты только для интерфейса (UI)
  const [selectedFreight, setSelectedFreight] = useState(null);
  const [viewModel, setViewModel] = useState('list');

  return (
    <div className="flex flex-col h-full gap-4 font-sans">
      <FreightsHeader
        count={data.freights.length}
        viewModel={viewModel}
        setViewModel={setViewModel}
      />
      {/* ПАНЕЛЬ ФИЛЬТРОВ (Выполняем требования диплома) */}
      <FreightsFilters
        filters={filters}
        isLoading={data.isLoading}
        handleSearch={actions.handleSearch}
      />

      {viewModel === 'list' ? (
        <FreightsTable
          freights={data.freights}
          handleFreight={setSelectedFreight}
          lastFreightElementRef={data.lastFreightElementRef}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col relative z-0">
          <FreightsMap
            freights={data.freights}
            onMarkerClick={setSelectedFreight}
          />
        </div>
      )}
      <FreightDrawer
        isOpen={!!selectedFreight} // Если в selectedFreight что-то есть, передаст true
        onClose={() => setSelectedFreight(null)} // При закрытии очищаем стейт
        freightId={selectedFreight?.id}
      />
    </div>
  );
};

export default Freights;
