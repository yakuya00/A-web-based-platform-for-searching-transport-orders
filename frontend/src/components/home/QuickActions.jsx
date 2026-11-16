import React from 'react';
import RoleGuard from '@/components/RoleGuard';
import { Link } from 'react-router-dom';
import { Truck, PlusCircle, Search, Users } from 'lucide-react';

/**
 * Komponent pro rychlou navigaci v dashboardu.
 * @todo (Refactor) PŘEVÉST NA SHADCN UI.
 * @returns {JSX.Element}
 */
export const QuickActions = () => {
  return (
    <div className="lg:col-span-1 space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Rychlé akce</h3>

      <div className="grid grid-cols-1 gap-3">
        <RoleGuard requireCompanyPermission={'CAN_SEE_FREIGHTS'}>
          <Link
            to="/freights/search"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Hledat přepravu</p>
              <p className="text-xs text-gray-500">
                Najít volné náklady na burze
              </p>
            </div>
          </Link>
        </RoleGuard>
        <RoleGuard requireCompanyPermission={'CAN_ADD_FREIGHT'}>
          <Link
            to="/freights/add"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-green-200 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-blue-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Přidat nabídku</p>
              <p className="text-xs text-gray-500">Vytvořit novou přepravu</p>
            </div>
          </Link>
        </RoleGuard>
        <RoleGuard requireCompanyPermission={'CAN_ADD_VEHICLE'}>
          <Link
            to="/fleet"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-amber-200 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Můj vozový park</p>
              <p className="text-xs text-gray-500">Správa vozidel a řidičů</p>
            </div>
          </Link>
        </RoleGuard>

        <RoleGuard requireUserPermission={'CAN_MANAGE_COMPANY'}>
          <Link
            to="/my-team"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Můj tým</p>
              <p className="text-xs text-gray-500">Správa řidičů a dispečerů</p>
            </div>
          </Link>
        </RoleGuard>
      </div>
    </div>
  );
};
