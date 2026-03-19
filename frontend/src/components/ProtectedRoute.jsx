import { Navigate, useLocation } from "react-router-dom";
import Loader from "./Loader";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (loading) {
    return <Loader label={t("common.checkingSession")} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default ProtectedRoute;
