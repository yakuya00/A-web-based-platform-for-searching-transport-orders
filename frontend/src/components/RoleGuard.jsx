import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/config/permissions';

const RoleGuard = ({
  requireUserPermission,
  requireCompanyPermission,
  children,
}) => {
  const { user } = useAuth();

  if (!user) return null;

  if (requireUserPermission) {
    const allowedUserRoles = PERMISSIONS[requireUserPermission];
    if (!allowedUserRoles.includes(user.role_id)) return null;
  }

  if (requireCompanyPermission) {
    const allowedCompanyRoles = PERMISSIONS[requireCompanyPermission];
    if (!allowedCompanyRoles.includes(user.company_role_id)) return null;
  }

  return <>{children}</>;
};

export default RoleGuard;
