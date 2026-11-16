import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import RoleGuard from '@/components/RoleGuard';
import Accordeon from '@/components/ui/Accordeon';
import {
  Package,
  Search,
  PlusCircle,
  Building2,
  ClipboardList,
  FileText,
  Truck,
  Users,
} from 'lucide-react';

/**
 * Hlavní postranní navigační panel (Sidebar).
 * @todo (Refactor) PŘEVÉST NA SHADCN UI:
 */
const Sidebar = () => {
  const location = useLocation();

  /**
   * Detekuje, zda je odkaz aktivní na základě aktuální URL.
   * @param {string} path - Cesta odkazu ke kontrole.
   * @returns {string} Tailwind třídy pro aktivní/neaktivní stav.
   */
  const isActive = (path) =>
    location.pathname === path
      ? 'bg-slate-100 text-slate-900 font-semibold shadow-sm'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors';

  const linkClass = 'px-3 py-1.5 rounded-lg flex items-center group gap-3';

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link to="/">
          <span className="text-2xl font-black text-blue-600 tracking-tight">
            LOGIX.
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2 text-sm">
        <Accordeon
          icon={<Package className="w-5 h-5 text-slate-700" />}
          text="Přepravy"
        >
          <div className="mt-1 flex flex-col gap-1 pl-7">
            <RoleGuard requireCompanyPermission="CAN_SEE_FREIGHTS">
              <Link
                to="/freights/search"
                className={`${linkClass} ${isActive('/freights/search')}`}
              >
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                Hledat přepravu
              </Link>
            </RoleGuard>

            <RoleGuard requireCompanyPermission="CAN_ADD_FREIGHT">
              <Link
                to="/freights/add"
                className={`${linkClass} ${isActive('/freights/add')}`}
              >
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                  <PlusCircle className="w-4 h-4" />
                </div>
                Přidat nabídku
              </Link>
            </RoleGuard>
          </div>
        </Accordeon>

        <Accordeon
          icon={<Building2 className="w-5 h-5 text-slate-700" />}
          text="Moje firma"
        >
          <div className="mt-1 flex flex-col gap-1 pl-7">
            <RoleGuard requireCompanyPermission="CAN_ADD_FREIGHT">
              <Link
                to="/my-orders"
                className={`${linkClass} ${isActive('/my-orders')}`}
              >
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                  <ClipboardList className="w-4 h-4" />
                </div>
                Aktivní zakázky
              </Link>
            </RoleGuard>

            <RoleGuard requireCompanyPermission="CAN_SEE_FREIGHTS">
              <Link
                to="/my-offers"
                className={`${linkClass} ${isActive('/my-offers')}`}
              >
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                Moje nabídky
              </Link>
            </RoleGuard>

            <RoleGuard requireCompanyPermission="CAN_ADD_VEHICLE">
              <Link
                to="/fleet"
                className={`${linkClass} ${isActive('/fleet')}`}
              >
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                Vozový park
              </Link>
            </RoleGuard>

            <RoleGuard requireUserPermission="CAN_MANAGE_COMPANY">
              <Link
                to="/my-team"
                className={`${linkClass} ${isActive('/my-team')}`}
              >
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                Můj tým
              </Link>
            </RoleGuard>
          </div>
        </Accordeon>
      </nav>
    </aside>
  );
};

export default Sidebar;
