import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
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
 * Komponenta pro zobrazení reálné trasy na mapě a výpočet logistických metrik.
 * @param {Object} props
 * @param {number} props.fromLat - Zeměpisná šířka nakládky.
 * @param {number} props.fromLon - Zeměpisná délka nakládky.
 * @param {number} props.toLat - Zeměpisná šířka vykládky.
 * @param {number} props.toLon - Zeměpisná délka vykládky.
 * @param {number|string} [props.price] - Nabízená celková cena za přepravu.
 * @todo (Feature) Zobrazit do mapy i ikony nakládky/vykládky místo výchozích modrých markerů.
 */
const RouteMap = ({ fromLat, fromLon, toLat, toLon, price }) => {
  const start = [fromLat, fromLon];
  const end = [toLat, toLon];

  const [routePoints, setRoutePoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          // Transformace souřadnic z GeoJSON (Lon, Lat) do Leaflet (Lat, Lon)
          const coords = data.routes[0].geometry.coordinates.map((c) => [
            c[1],
            c[0],
          ]);
          setRoutePoints(coords);

          const distKm = data.routes[0].distance / 1000;
          const pricePerKm = (price / distKm).toFixed(2);
          const distKmStr = distKm.toFixed(0);

          setRouteInfo({ distance: distKmStr, pricePerKm: pricePerKm });
        }
      } catch (error) {
        console.error('Chyba při stahování trasy OSRM:', error);
      }
    };

    fetchRoute();
  }, [fromLat, fromLon, toLat, toLon]);

  const center = [(fromLat + toLat) / 2, (fromLon + toLon) / 2];

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
      {routeInfo && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur shadow-md px-3 py-2 rounded-xl border border-gray-100 flex flex-col gap-0.5 pointer-events-none">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Trasa
          </span>
          <span className="font-bold text-blue-700 text-sm">
            🛣️ {routeInfo.distance} km
          </span>
          <span className="font-medium text-gray-600 text-xs">
            💲 {routeInfo.pricePerKm}/km
          </span>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <Marker position={start} />
        <Marker position={end} />

        <Polyline
          positions={routePoints.length > 0 ? routePoints : [start, end]}
          color="#3b82f6"
          weight={5}
          opacity={0.8}
        />
      </MapContainer>
    </div>
  );
};

export default RouteMap;
