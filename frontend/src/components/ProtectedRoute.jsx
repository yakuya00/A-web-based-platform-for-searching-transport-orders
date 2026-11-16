import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS, USER_ROLES } from '@/config/permissions';

/**
 * Bezpečnostní brána pro React Router (Protected Route).
 * * Zajišťuje:
 * 1. Ochranu privátních cest před nepřihlášenými uživateli.
 * 2. Dvouvrstvé RBAC ověřování (Role uživatele v týmu + Typ firmy na trhu).
 * @param {Object} props
 * @param {string} [props.requireUserPermission] - Konstanta oprávnění uživatele (např. 'CAN_MANAGE_COMPANY').
 * @param {string} [props.requireCompanyPermission] - Konstanta oprávnění firmy (např. 'CAN_ADD_FREIGHT').
 * @todo (UX) Nahradit hardkódovaný <div> "Načítání..." za Shadcn Spinner nebo globální <Loader /> komponentu.
 */
const ProtectedRoute = ({
  requireUserPermission,
  requireCompanyPermission,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-gray-500">Načítání...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // --- KONTROLA OPRÁVNĚNÍ UŽIVATELE (Interní role ve firmě) ---
  if (requireUserPermission) {
    const allowedUserRoles = PERMISSIONS[requireUserPermission];

    if (allowedUserRoles && !allowedUserRoles.includes(Number(user.role_id))) {
      if (Number(user.role_id) === USER_ROLES.DRIVER) {
        return <Navigate to="/driver" replace />;
      }

      return <Navigate to="/" replace />;
    }
  }
  // --- KONTROLA OPRÁVNĚNÍ FIRMY (Typ firmy na trhu) ---
  if (requireCompanyPermission) {
    const allowedCompanyRoles = PERMISSIONS[requireCompanyPermission];

    if (
      allowedCompanyRoles &&
      !allowedCompanyRoles.includes(Number(user.company_role_id))
    ) {
      return <Navigate to="/" replace />;
    }
  }
  return <Outlet />;
};

export default ProtectedRoute;
