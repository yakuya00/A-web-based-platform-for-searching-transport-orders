import React from 'react';
import { Button } from '@/components/ui/Button';
import { List, Map } from 'lucide-react';

/**
 * Hlavička stránky s burzou přeprav (Freights).
 * * Tento komponent zajišťuje:
 * 1. Zobrazení dynamického počtu nalezených nabídek.
 * 2. Přepínání mezi seznamem (list) a mapovým zobrazením (map) pomocí tabů.
 * @param {Object} props
 * @param {number} props.count - Počet nalezených záznamů odpovídajících filtrům.
 * @param {'list'|'map'} props.viewModel - Aktuálně zvolený režim zobrazení.
 * @param {Function} props.setViewModel - Setter funkce pro změnu režimu zobrazení.
 * @returns {JSX.Element}
 */
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
          className="gap-2"
        >
          <List className="h-4 w-4" />
          Seznam
        </Button>

        <Button
          variant="tab"
          data-active={viewModel === 'map'}
          onClick={() => setViewModel('map')}
          className="gap-2"
        >
          <Map className="h-4 w-4" />
          Mapa
        </Button>
      </div>
    </div>
  );
};

export default FreightsHeader;
