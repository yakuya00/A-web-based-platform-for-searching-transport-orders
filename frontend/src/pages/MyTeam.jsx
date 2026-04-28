import React, { useState } from 'react';
import MyTeamTable from '@/components/myTeam/MyTeamTable';
import MyTeamDialog from '@/components/myTeam/MyTeamDialog';
import { useMyTeam } from '@/hooks/useMyTeam';

export default function MyTeam() {
  const { employees, fetchEmployees } = useMyTeam();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Můj tým</h1>
          <p className="text-gray-500">
            Správa zaměstnanců a řidičů vaší firmy
          </p>
        </div>
        <MyTeamDialog onSuccess={fetchEmployees} />
      </div>

      <MyTeamTable employees={employees} />
    </div>
  );
}
