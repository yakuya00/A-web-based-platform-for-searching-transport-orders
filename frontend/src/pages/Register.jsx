import React, { useState } from 'react';
import { useRegister } from '@/hooks/useRegister';
import { RoleSelection } from '@/components/registration/RoleSelection';
import { CompanyForm } from '@/components/registration/CompanyForm';
import { ManagerForm } from '@/components/registration/ManagerForm';

export default function Register() {
  const [step, setStep] = useState(1);
  const { data, actions } = useRegister();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="bg-surface p-8 rounded-xl w-full max-w-md shadow-lg border border-gray-100">
        {/* Прогресс бар */}
        <div className="mb-6 flex gap-2">
          <div
            className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}
          ></div>
        </div>

        {/* Логика переключения шагов */}
        {step === 1 && (
          <RoleSelection
            onSelect={(companyRoleId) => {
              actions.updateData({ companyRoleId });
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <CompanyForm
            data={data.formData}
            updateData={actions.updateData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ManagerForm
            data={data.formData}
            updateData={actions.updateData}
            onSubmit={actions.handleFinalSubmit}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
