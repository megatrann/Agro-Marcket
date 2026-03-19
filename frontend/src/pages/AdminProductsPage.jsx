import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import adminService from "../services/adminService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatCurrency } from "../utils/format";

function AdminProductsPage() {
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
    return <Loader label="Loading products..." />;
  }

  return (
    <section className="page-card">
      <div className="section-head">
        <h2>Product Management</h2>
        <p className="muted">{products.length} products</p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Seller</th>
              <th>Retail Price</th>
              <th>Location</th>
              <th>Organic</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.title}</td>
                <td>{product.seller?.name || "-"}</td>
                <td>{formatCurrency(product.retailPrice)}</td>
                <td>{product.location}</td>
                <td>{product.organic ? "Yes" : "No"}</td>
                <td>
                  <button type="button" className="btn btn-outline" onClick={() => handleDelete(product.id)}>
                    Delete
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
