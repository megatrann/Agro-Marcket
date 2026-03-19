import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import adminService from "../services/adminService";
import { getApiErrorMessage } from "../utils/apiError";
import { useLanguage } from "../context/LanguageContext";

function AdminDashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await adminService.getDashboardStats();
        setStats(data.stats);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load dashboard stats."));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Loader label={t("admin.loadingDashboard")} />;
  }

  if (error) {
    return <section className="page-card error-text">{error}</section>;
  }

  return (
    <section className="admin-grid">
      <article className="admin-stat-card page-card stat-users">
        <p className="stat-label">{t("admin.platformReach")}</p>
        <h3>{t("admin.totalUsers")}</h3>
        <p className="stat-value">{stats?.totalUsers ?? 0}</p>
      </article>
      <article className="admin-stat-card page-card stat-sellers">
        <p className="stat-label">{t("admin.supplyNetwork")}</p>
        <h3>{t("admin.totalFarmerVendors")}</h3>
        <p className="stat-value">{stats?.totalFarmerVendors ?? 0}</p>
      </article>
      <article className="admin-stat-card page-card stat-products">
        <p className="stat-label">{t("admin.marketplaceDepth")}</p>
        <h3>{t("admin.totalProducts")}</h3>
        <p className="stat-value">{stats?.totalProducts ?? 0}</p>
      </article>
      <article className="admin-stat-card page-card stat-orders">
        <p className="stat-label">{t("admin.transactionFlow")}</p>
        <h3>{t("admin.totalOrders")}</h3>
        <p className="stat-value">{stats?.totalOrders ?? 0}</p>
      </article>
    </section>
  );
}

export default AdminDashboardPage;
