import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import productService from "../services/productService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatCurrency, formatDate } from "../utils/format";

function MyProductsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canManageProducts = ["farmer", "vendor", "admin"].includes(user?.role);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await productService.getMyProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load your products."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canManageProducts) {
      return;
    }

    fetchProducts();
  }, [canManageProducts]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete product."));
    }
  };

  if (!canManageProducts) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <Loader label="Loading your products..." />;
  }

  return (
    <section className="page-card">
      <div className="section-head">
        <h2>My Products</h2>
        <p className="muted">{products.length} items</p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {products.length === 0 ? (
        <p>
          You have no products yet. <Link to="/products/new">Add your first product</Link>.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.title")}</th>
                <th>{t("products.category")}</th>
                <th>{t("add.retail")}</th>
                <th>{t("product.availableQty")}</th>
                <th>{t("admin.date")}</th>
                <th>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link to={`/product/${product.id}`}>{product.title}</Link>
                  </td>
                  <td>{product.category}</td>
                  <td>{formatCurrency(product.retailPrice)}</td>
                  <td>{product.quantity}</td>
                  <td>{formatDate(product.createdAt)}</td>
                  <td style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <Link className="btn btn-outline" to={`/product/${product.id}`}>
                      View
                    </Link>
                    <button type="button" className="btn btn-outline" onClick={() => handleDelete(product.id)}>
                      {t("admin.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default MyProductsPage;
