import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import adminService from "../services/adminService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatCurrency, formatDate } from "../utils/format";

function AdminOrdersPage() {
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
    return <Loader label="Loading orders..." />;
  }

  return (
    <section className="page-card">
      <div className="section-head">
        <h2>Order Management</h2>
        <p className="muted">{orders.length} orders</p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Items</th>
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
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
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
