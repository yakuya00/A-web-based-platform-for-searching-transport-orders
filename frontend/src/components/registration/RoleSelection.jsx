import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRoleSelection } from '@/hooks/useRoleSelection';

/**
 * Úvodní krok registrace: Výběr obchodní role společnosti.
 * * Tento komponent definuje identitu firmy v systému:
 * 1. Shipper (Odesílatel): Ten, kdo má náklad a hledá auto.
 * 2. Carrier (Dopravce): Ten, kdo má auto a hledá náklad.
 * 3. Warehouse (Spedice): Ten, kdo má a auto a náklad.
 * @param {Object} props
 * @param {Function} props.onSelect - Callback předávající ID zvolené role do rodičovského stavu registrace.
 * @todo (Refactor) Převést na Shadcn UI
 */
export const RoleSelection = ({ onSelect }) => {
  /** * Hook pro fetchování dostupných rolí z API.
   * @see hooks/useRoleSelection
   */
  const { roles, isLoading } = useRoleSelection();

  if (isLoading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-center text-gray-800">Kdo jste?</h2>
      <div className="grid grid-cols-1 gap-4">
        {roles.map((role) => (
          <Button
            key={role.id}
            onClick={() => onSelect(role.id)}
            variant="role_selection"
            size="role_selection"
          >
            <span className="text-4xl mb-2">{role.icon}</span>
            <span className="font-bold text-lg text-gray-700 group-hover:text-blue-600">
              {role.label}
            </span>
            <span className="text-xs text-gray-500 mt-1 font-medium">
              {role.description}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
