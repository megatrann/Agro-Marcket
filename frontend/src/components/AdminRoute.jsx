import { Navigate } from "react-router-dom";
import Loader from "./Loader";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <Loader label="Checking access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
