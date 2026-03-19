import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import orderService from "../services/orderService";
import { formatCurrency } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";
import { FALLBACK_IMAGE, resolveImageUrl } from "../utils/image";
import { useLanguage } from "../context/LanguageContext";

function CartPage() {
  const navigate = useNavigate();
  const { items, loading, totalPrice, updateItem, removeItem, refreshCart } = useCart();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity), 0),
    [items]
  );

  const handleUpdate = async (id, quantity) => {
    setError("");
    const parsed = Number(quantity);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError("Quantity must be at least 1.");
      return;
    }

    try {
      await updateItem(id, parsed);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update cart item."));
    }
  };

  const handleRemove = async (id) => {
    setError("");
    try {
      await removeItem(id);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to remove cart item."));
    }
  };

  const handleCheckout = async () => {
    setSubmitting(true);
    setError("");
    try {
      await orderService.createOrder();
      await refreshCart();
      navigate("/orders");
    } catch (err) {
      setError(getApiErrorMessage(err, "Checkout failed."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader label={t("cart.loading")} />;
  }

  return (
    <section className="page-card">
      <div className="section-head">
        <h2>{t("cart.title")}</h2>
        <p className="muted">{t("cart.items", { count: totalQuantity })}</p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {items.length === 0 ? (
        <p>{t("cart.empty")}</p>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <article key={item.id} className="cart-item">
                <img
                  src={resolveImageUrl(item.product?.images?.[0])}
                  alt={item.product?.title}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="cart-item-body">
                  <h3>{item.product?.title}</h3>
                  <p className="muted">{item.product?.location}</p>
                  <p>{formatCurrency(item.product?.retailPrice)}</p>
                </div>
                <div className="cart-item-actions">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => handleUpdate(item.id, event.target.value)}
                  />
                  <button type="button" className="btn btn-outline" onClick={() => handleRemove(item.id)}>
                    {t("cart.remove")}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="checkout-bar">
            <h3>{t("cart.total")}: {formatCurrency(totalPrice)}</h3>
            <button type="button" className="btn btn-primary" onClick={handleCheckout} disabled={submitting}>
              {submitting ? t("cart.processing") : t("cart.checkout")}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default CartPage;
