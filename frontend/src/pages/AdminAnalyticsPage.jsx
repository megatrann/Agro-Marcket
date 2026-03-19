import { useCallback, useEffect, useState } from "react";
import adminService from "../services/adminService";

function AdminAnalyticsPage() {
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
      setError(err?.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return <p>Loading analytics...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <section>
      <div className="page-header-row">
        <h1>Analytics</h1>
        <button type="button" className="btn secondary" onClick={loadAnalytics}>
          Refresh
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: "1rem" }}>
        <article className="stat-card">
          <p>Total Users</p>
          <h3>{overview?.totalUsers ?? 0}</h3>
        </article>
        <article className="stat-card">
          <p>Total Farmers</p>
          <h3>{overview?.totalFarmers ?? 0}</h3>
        </article>
        <article className="stat-card">
          <p>Total Products</p>
          <h3>{overview?.totalProducts ?? 0}</h3>
        </article>
        <article className="stat-card">
          <p>Total Orders</p>
          <h3>{overview?.totalOrders ?? 0}</h3>
        </article>
        <article className="stat-card">
          <p>Total Revenue</p>
          <h3>Rs {Number(overview?.totalRevenue || 0).toFixed(2)}</h3>
        </article>
      </div>

      <div className="page-card" style={{ marginBottom: "1rem" }}>
        <h2>Sales By Category</h2>
        <ul>
          {salesByCategory.map((item) => (
            <li key={item.category}>
              {item.category}: {item.unitsSold} units, Rs {Number(item.revenue || 0).toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <div className="page-card" style={{ marginBottom: "1rem" }}>
        <h2>Top Products</h2>
        <ul>
          {topProducts.map((item) => (
            <li key={item.id}>
              {item.title}: {item.unitsSold} units, Rs {Number(item.revenue || 0).toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <div className="page-card" style={{ marginBottom: "1rem" }}>
        <h2>Top Farmers</h2>
        <ul>
          {topFarmers.map((item) => (
            <li key={item.id}>
              {item.name}: {item.unitsSold} units, Rs {Number(item.revenue || 0).toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <div className="page-card">
        <h2>Location Demand</h2>
        <ul>
          {locationDemand.map((item) => (
            <li key={item.location}>
              {item.location}: {item.orderCount} orders, {item.unitsDemanded} units
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default AdminAnalyticsPage;
