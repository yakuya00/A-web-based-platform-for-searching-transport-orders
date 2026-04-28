import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRoleSelection } from '@/hooks/useRoleSelection';

export const RoleSelection = ({ onSelect }) => {
  const { roles, isLoading } = useRoleSelection();

  if (isLoading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-center text-secondary">
        Kdo jste?
      </h2>
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
