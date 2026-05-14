import React, { useState, useEffect } from 'react';
import $api from '@/api/axiosInstance';
import { MapPin, Calendar, Package, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Widget pro zobrazení seznamu aktuálně probíhajících přeprav (Dashboard).
 * * Tento komponent zajišťuje:
 * 1. Automatické načtení aktivních zásilek po montáži komponenty.
 * 2. Zobrazení klíčových metrik (trasa, datum, váha, typ nákladu).
 * 3. Vizuální odlišení stavu zakázky pomocí barevných štítků (Badge).
 * @todo (Refactor) Vyčlenit logiku fetchování do vlastního hooku 'useActiveShipments'.
 * @todo (Refactor) PŘEVÉST CELÝ KOMPONENT NA SHADCN UI.
 * @returns {JSX.Element}
 */
export const ActiveShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await $api.get('/common/active-shipments');
        console.log(response.data);
        setShipments(response.data);
      } catch (error) {
        console.error('Chyba při načítání zásilek:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShipments();
  }, []);

  const renderStatusBadge = (statusName) => {
    switch (statusName) {
      case 'created':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Hledá se
          </Badge>
        );
      case 'assign':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent">
            Přiděleno
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-transparent">
            Na cestě
          </Badge>
        );
      default:
        return <Badge variant="secondary">{statusName}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin text-blue-500 w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {shipments.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 font-medium">
            Zatím nemáte žádné aktivní zásilky.
          </p>
        </div>
      ) : (
        shipments.map((shipment) => (
          <div className="block p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600 font-bold text-sm">
                  #{shipment.id}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
                    <span>
                      {shipment.loading_city}, {shipment.loading_country}
                    </span>
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>
                      {shipment.unloading_city}, {shipment.unloading_country}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    {shipment.loading_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {new Date(shipment.loading_date).toLocaleDateString(
                            'cs-CZ',
                            {
                              day: 'numeric',
                              month: 'short',
                            }
                          )}
                        </span>
                      </div>
                    )}

                    <span className="text-gray-300">•</span>

                    <div className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {shipment.weight ? `${shipment.weight} t` : ''}
                        {shipment.cargo_type ? ` - ${shipment.cargo_type}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {renderStatusBadge(shipment.status_name)}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
