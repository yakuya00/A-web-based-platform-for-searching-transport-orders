import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/config/permissions';

/**
 * Komponenta pro podmíněné vykreslování UI prvků na základě oprávnění (RBAC).
 * @param {Object} props
 * @param {string} [props.requireUserPermission] - Klíč oprávnění z PERMISSIONS (např. 'CAN_MANAGE_COMPANY').
 * @param {string} [props.requireCompanyPermission] - Klíč oprávnění firmy (např. 'CAN_ADD_FREIGHT').
 * @param {React.ReactNode} props.children - Obsah, který se vyrenderuje při úspěšné autorizaci.
 */
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
