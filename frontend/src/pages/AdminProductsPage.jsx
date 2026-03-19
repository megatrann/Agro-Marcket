import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import adminService from "../services/adminService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatCurrency } from "../utils/format";
import { useLanguage } from "../context/LanguageContext";

function AdminProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load products."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await adminService.deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete product."));
    }
  };

  if (loading) {
    return <Loader label={t("admin.loadingProducts")} />;
  }

  return (
    <section className="page-card">
      <div className="section-head">
        <h2>{t("admin.productManagement")}</h2>
        <p className="muted">{t("admin.productsCount", { count: products.length })}</p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.title")}</th>
              <th>{t("admin.seller")}</th>
              <th>{t("add.retail")}</th>
              <th>{t("product.location")}</th>
              <th>{t("products.organic")}</th>
              <th>{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.title}</td>
                <td>{product.seller?.name || "-"}</td>
                <td>{formatCurrency(product.retailPrice)}</td>
                <td>{product.location}</td>
                <td>{product.organic ? t("admin.yes") : t("admin.no")}</td>
                <td>
                  <button type="button" className="btn btn-outline" onClick={() => handleDelete(product.id)}>
                    {t("admin.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminProductsPage;
