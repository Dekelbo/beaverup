import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Block app pages when logged out ---
function ProtectedRoute() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
