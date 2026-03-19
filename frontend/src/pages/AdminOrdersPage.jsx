import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import adminService from "../services/adminService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatCurrency, formatDate } from "../utils/format";
import { useLanguage } from "../context/LanguageContext";

function AdminOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load orders."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await adminService.updateOrder(id, status);
      await fetchOrders();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update order status."));
    }
  };

  if (loading) {
    return <Loader label={t("admin.loadingOrders")} />;
  }

  return (
    <section className="page-card">
      <div className="section-head">
        <h2>{t("admin.orderManagement")}</h2>
        <p className="muted">{t("admin.ordersCount", { count: orders.length })}</p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.orderId")}</th>
              <th>{t("admin.buyer")}</th>
              <th>{t("orders.total")}</th>
              <th>{t("admin.status")}</th>
              <th>{t("admin.date")}</th>
              <th>{t("admin.items")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.buyer?.name || "-"}</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>
                  <select value={order.status} onChange={(event) => handleStatusChange(order.id, event.target.value)}>
                    <option value="pending">{t("status.pending")}</option>
                    <option value="confirmed">{t("status.confirmed")}</option>
                    <option value="completed">{t("status.completed")}</option>
                    <option value="cancelled">{t("status.cancelled")}</option>
                  </select>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.items?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminOrdersPage;
