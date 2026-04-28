import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/config/permissions';

const ProtectedRoute = ({
  requireUserPermission,
  requireCompanyPermission,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireUserPermission) {
    const allowedUserRoles = PERMISSIONS[requireUserPermission];
    if (!allowedUserRoles.includes(user.role_id))
      return <Navigate to="/" replace />;
  }

  if (requireCompanyPermission) {
    const allowedCompanyRoles = PERMISSIONS[requireCompanyPermission];
    if (!allowedCompanyRoles.includes(user.company_role_id))
      return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
