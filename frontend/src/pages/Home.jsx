import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { StatsCards } from '@/components/home/StatsCards';
import { QuickActions } from '@/components/home/QuickActions';
import { USER_ROLES, COMPANY_ROLES } from '@/config/permissions';
import { Badge } from '@/components/ui/badge';
import { ActiveShipments } from '@/components/home/ActiveShipments';

/**
 * Hlavní Dashboard aplikace.
 */
const Dashboard = () => {
  const { user } = useAuth();

  const renderRoleBadge = () => {
    const roleId = Number(user?.role_id);

    switch (roleId) {
      case USER_ROLES.ADMIN:
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-transparent">
            Majitel / Admin
          </Badge>
        );
      case USER_ROLES.MANAGER:
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent">
            Dispečer
          </Badge>
        );
      case USER_ROLES.DRIVER:
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-transparent">
            Řidič
          </Badge>
        );
      default:
        return null;
    }
  };

  const today = new Intl.DateTimeFormat('cs-CZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Vítejte zpět, {user.name}! 👋
          </h1>
          {renderRoleBadge()}
        </div>
        <p className="text-sm text-gray-500 capitalize">{today}</p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <QuickActions />
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              Sledování zásilek
            </h3>
            <Link
              to={
                user.company_id === COMPANY_ROLES.CARRIER
                  ? '/my-offers'
                  : '/my-orders'
              }
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Zobrazit vše
            </Link>
          </div>
          <ActiveShipments />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
