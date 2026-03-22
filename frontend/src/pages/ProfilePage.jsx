import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { formatDate } from "../utils/format";

function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="page-card">
      <div className="section-head">
        <h2>My Profile</h2>
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        <p>
          <strong>{t("auth.name")}:</strong> {user.name}
        </p>
        <p>
          <strong>{t("auth.email")}:</strong> {user.email}
        </p>
        <p>
          <strong>{t("auth.role")}:</strong> {user.role}
        </p>
        <p>
          <strong>Member Since:</strong> {user.createdAt ? formatDate(user.createdAt) : t("common.na")}
        </p>
      </div>
    </section>
  );
}

export default ProfilePage;
