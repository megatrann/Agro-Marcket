import { useCallback, useEffect, useState } from "react";
import adminService from "../services/adminService";
import { formatCurrency } from "../utils/format";
import { useLanguage } from "../context/LanguageContext";

function AdminAnalyticsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topFarmers, setTopFarmers] = useState([]);
  const [locationDemand, setLocationDemand] = useState([]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        overviewResponse,
        categoryResponse,
        productsResponse,
        farmersResponse,
        locationResponse,
      ] = await Promise.all([
        adminService.getAnalyticsOverview(),
        adminService.getSalesByCategory(),
        adminService.getTopProductsAnalytics(),
        adminService.getTopFarmersAnalytics(),
        adminService.getLocationDemandAnalytics(),
      ]);

      setOverview(overviewResponse);
      setSalesByCategory(categoryResponse.salesByCategory || []);
      setTopProducts(productsResponse.topProducts || []);
      setTopFarmers(farmersResponse.topFarmers || []);
      setLocationDemand(locationResponse.locationDemand || []);
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.analyticsFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return <p>{t("admin.loadingAnalytics")}</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <section>
      <div className="page-header-row">
        <h1>{t("admin.analytics")}</h1>
        <button type="button" className="btn secondary" onClick={loadAnalytics}>
          {t("admin.refresh")}
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: "1rem" }}>
        <article className="stat-card">
          <p>{t("admin.totalUsers")}</p>
          <h3>{overview?.totalUsers ?? 0}</h3>
        </article>
        <article className="stat-card">
          <p>{t("admin.totalFarmers")}</p>
          <h3>{overview?.totalFarmers ?? 0}</h3>
        </article>
        <article className="stat-card">
          <p>{t("admin.totalProducts")}</p>
          <h3>{overview?.totalProducts ?? 0}</h3>
        </article>
        <article className="stat-card">
          <p>{t("admin.totalOrders")}</p>
          <h3>{overview?.totalOrders ?? 0}</h3>
        </article>
        <article className="stat-card">
          <p>{t("admin.totalRevenue")}</p>
          <h3>{formatCurrency(overview?.totalRevenue || 0)}</h3>
        </article>
      </div>

      <div className="page-card" style={{ marginBottom: "1rem" }}>
        <h2>{t("admin.salesByCategory")}</h2>
        <ul>
          {salesByCategory.map((item) => (
            <li key={item.category}>
              {t(`category.${item.category}`)}: {item.unitsSold} {t("admin.units")}, {formatCurrency(item.revenue || 0)}
            </li>
          ))}
        </ul>
      </div>

      <div className="page-card" style={{ marginBottom: "1rem" }}>
        <h2>{t("admin.topProducts")}</h2>
        <ul>
          {topProducts.map((item) => (
            <li key={item.id}>
              {item.title}: {item.unitsSold} {t("admin.units")}, {formatCurrency(item.revenue || 0)}
            </li>
          ))}
        </ul>
      </div>

      <div className="page-card" style={{ marginBottom: "1rem" }}>
        <h2>{t("admin.topFarmers")}</h2>
        <ul>
          {topFarmers.map((item) => (
            <li key={item.id}>
              {item.name}: {item.unitsSold} {t("admin.units")}, {formatCurrency(item.revenue || 0)}
            </li>
          ))}
        </ul>
      </div>

      <div className="page-card">
        <h2>{t("admin.locationDemand")}</h2>
        <ul>
          {locationDemand.map((item) => (
            <li key={item.location}>
              {item.location}: {item.orderCount} {t("admin.orders")}, {item.unitsDemanded} {t("admin.units")}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default AdminAnalyticsPage;
