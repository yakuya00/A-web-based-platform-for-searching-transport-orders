import React, { useState } from 'react';
import MyTeamTable from '@/components/myTeam/MyTeamTable';
import MyTeamDialog from '@/components/myTeam/MyTeamDialog';
import { useMyTeam } from '@/hooks/useMyTeam';

/**
 * Modul pro správu lidských zdrojů (My Team).
 */
export default function MyTeam() {
  const { employees, fetchEmployees } = useMyTeam();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Můj tým</h1>
          <p className="text-gray-500 mt-1">
            Správa zaměstnanců a řidičů vaší firmy
          </p>
        </div>
        <MyTeamDialog onSuccess={fetchEmployees} />
      </div>

      <MyTeamTable employees={employees} onSuccess={fetchEmployees} />
    </div>
  );
}
