import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Interaktivní mapový pohled na dostupné přepravy (Map View).
 * * Zobrazuje markery na místech nakládky (Pickup locations) pro rychlou prostorovou orientaci.
 * @param {Object} props
 * @param {Array} props.freights - Seznam aktuálně vyfiltrovaných nákladů (musí obsahovat from_lat a from_lon).
 * @param {Function} props.onMarkerClick - Callback pro otevření detailu nákladu (typicky otevírá FreightDrawer).
 * @todo (Performance) Implementovat 'Marker Clustering' (např. pomocí react-leaflet-cluster). Pokud bude na mapě 500+ nákladů, čistý Leaflet se začne sekat.
 * @todo (Refactor) Převést na Shadcn UI
 */
const FreightsMap = ({ freights, onMarkerClick }) => {
  // Výchozí střed Evropy - ideální pro start pohledu
  const defaultCenter = [49.8, 15.5];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {freights.map((freight) => {
          if (!freight.from_lat || !freight.from_lon) return null;

          return (
            <Marker
              key={freight.id}
              position={[freight.from_lat, freight.from_lon]}
            >
              <Popup>
                <div className="text-sm min-w-[150px]">
                  <p className="font-bold text-gray-900 mb-1">
                    Nakládka: {freight.from}
                  </p>
                  <p className="text-gray-600 text-xs mb-2">
                    ➔ Vykládka: {freight.to}
                  </p>

                  <div className="bg-green-50 p-2 rounded border border-green-100 mb-2 text-center">
                    <span className="font-bold text-green-700">
                      {freight.price
                        ? `${freight.price} ${freight.currency || '€'}`
                        : 'Dohodou'}
                    </span>
                  </div>

                  <button
                    onClick={() => onMarkerClick(freight)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded transition-colors"
                  >
                    Ukázat detail
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default FreightsMap;
