import { Navigate } from "react-router-dom";
import Loader from "./Loader";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function AdminRoute({ children }) {
  const { loading, isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return <Loader label={t("common.checkingAccess")} />;
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
