import { useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/userContext";


export const AdminGuard = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login-admin-sys" state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  return children ? children : <Outlet />;
};
