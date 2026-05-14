import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { COMPANY_ROLES } from '@/config/permissions';
import { Truck, Package, CheckCircle2, MapPin, Clock } from 'lucide-react';
import { useStatsCards } from '@/hooks/useStatsCards';

/**
 * Přehledové karty statistik (KPI Dashboard).
 * Komponenta dynamicky přizpůsobuje svůj obsah roli přihlášené společnosti:
 * - Odesílatel (Shipper): Vidí statistiky zaměřené na náklady a balíky.
 * - Dopravce (Carrier): Vidí statistiky zaměřené na vozidla a trasy.
 * @param {Object} props
 * @param {Object} [props.stats] - Volitelný objekt se statickými daty (prioritu má hook).
 * @todo (Refactor) PŘEVÉST NA SHADCN UI
 * @todo (Logic) Sjednotit názvosloví v 'data' (stat1, stat2 by měly mít sémantické názvy jako activeOrders, atd.).
 */
export const StatsCards = ({ stats = {} }) => {
  const { user } = useAuth();
  const companyRole = Number(user?.company_role_id);

  /**
   * Hook zajišťující fetchování agregovaných dat z backendu.
   * @see hooks/useStatsCards
   */
  const { data } = useStatsCards();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          {companyRole === COMPANY_ROLES.SHIPPER ? (
            <Package className="w-6 h-6" />
          ) : (
            <MapPin className="w-6 h-6" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">
            {companyRole === COMPANY_ROLES.SHIPPER
              ? 'Hledá se dopravce'
              : 'Aktivní přepravy'}{' '}
          </p>
          <h3 className="text-2xl font-bold text-gray-900">{data.stat1}</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
          {companyRole === COMPANY_ROLES.SHIPPER ? (
            <Clock className="w-6 h-6" />
          ) : (
            <Truck className="w-6 h-6" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">
            {companyRole === COMPANY_ROLES.SHIPPER
              ? 'Náklady na cestě'
              : 'Vozidla na cestě'}{' '}
          </p>
          <h3 className="text-2xl font-bold text-gray-900">{data.stat2}</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">
            Dokončeno (Tento měsíc)
          </p>
          <h3 className="text-2xl font-bold text-gray-900">{data.completed}</h3>
        </div>
      </div>
    </div>
  );
};
