import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import adminService from "../services/adminService";
import { getApiErrorMessage } from "../utils/apiError";

function AdminDashboardPage() {
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
    return <Loader label="Loading dashboard..." />;
  }

  if (error) {
    return <section className="page-card error-text">{error}</section>;
  }

  return (
    <section className="admin-grid">
      <article className="admin-stat-card page-card">
        <h3>Total Users</h3>
        <p>{stats?.totalUsers ?? 0}</p>
      </article>
      <article className="admin-stat-card page-card">
        <h3>Total Farmers/Vendors</h3>
        <p>{stats?.totalFarmerVendors ?? 0}</p>
      </article>
      <article className="admin-stat-card page-card">
        <h3>Total Products</h3>
        <p>{stats?.totalProducts ?? 0}</p>
      </article>
      <article className="admin-stat-card page-card">
        <h3>Total Orders</h3>
        <p>{stats?.totalOrders ?? 0}</p>
      </article>
    </section>
  );
}

export default AdminDashboardPage;
