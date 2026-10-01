import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RoleRoute({ allow, children }) {
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.role;
  const ok = Array.isArray(allow) ? allow.includes(role) : false;

  if (!ok) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
}

export default RoleRoute;

