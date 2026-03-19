import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import orderService from "../services/orderService";
import { formatCurrency } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";

function CartPage() {
  const navigate = useNavigate();
  const { items, loading, totalPrice, updateItem, removeItem, refreshCart } = useCart();
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
    return <Loader label="Loading cart..." />;
  }

  return (
    <section className="page-card">
      <div className="section-head">
        <h2>My Cart</h2>
        <p className="muted">{totalQuantity} items</p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <article key={item.id} className="cart-item">
                <img
                  src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=600&q=80"}
                  alt={item.product?.title}
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
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="checkout-bar">
            <h3>Total: {formatCurrency(totalPrice)}</h3>
            <button type="button" className="btn btn-primary" onClick={handleCheckout} disabled={submitting}>
              {submitting ? "Processing..." : "Checkout"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default CartPage;
