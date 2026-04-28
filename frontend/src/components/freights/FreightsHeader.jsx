import React from 'react';
import { Button } from '@/components/ui/Button';

const FreightsHeader = ({ count, viewModel, setViewModel }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hledat přepravu</h1>
        <p className="text-sm text-gray-500 mt-1">
          Nalezeno {count} aktuálních nabídek
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm">
        <Button
          variant="tab"
          data-active={viewModel === 'list'}
          onClick={() => setViewModel('list')}
        >
          📄 Seznam
        </Button>

        <Button
          variant="tab"
          data-active={viewModel === 'map'}
          onClick={() => setViewModel('map')}
        >
          🗺️ Mapa
        </Button>
      </div>
    </div>
  );
};

export default FreightsHeader;
