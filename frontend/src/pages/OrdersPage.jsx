import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import orderService from "../services/orderService";
import { formatCurrency, formatDate } from "../utils/format";
import { ORDER_STATUS_COLORS } from "../utils/constants";
import { getApiErrorMessage } from "../utils/apiError";
import { useLanguage } from "../context/LanguageContext";

function OrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await orderService.getMyOrders();
        setOrders(data.orders || []);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load order history."));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <Loader label={t("orders.loading")} />;
  }

  return (
    <section className="page-card">
      <div className="section-head">
        <h2>{t("orders.title")}</h2>
        <p className="muted">{t("orders.count", { count: orders.length })}</p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {orders.length === 0 ? (
        <p>{t("orders.none")}</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <header className="order-head">
                <h3>{t("orders.order")} #{order.id}</h3>
                <span className={`order-status ${ORDER_STATUS_COLORS[order.status] || ""}`}>
                  {order.status}
                </span>
              </header>
              <p className="muted">{t("orders.placed")}: {formatDate(order.createdAt)}</p>
              <p>{t("orders.total")}: {formatCurrency(order.totalAmount)}</p>

              <div className="order-items">
                {order.items?.map((item) => (
                  <div className="order-item" key={item.id}>
                    <p>{item.product?.title}</p>
                    <p>
                      {item.quantity} x {formatCurrency(item.priceAtPurchase)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrdersPage;
