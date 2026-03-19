import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import useDebounce from "../hooks/useDebounce";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import productService from "../services/productService";
import { CATEGORY_OPTIONS } from "../utils/constants";
import { getApiErrorMessage } from "../utils/apiError";

function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [filters, setFilters] = useState({
    category: params.get("category") || "",
    location: "",
    organic: "",
    minPrice: "",
    maxPrice: "",
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedLocation = useDebounce(filters.location, 350);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const query = {
          ...(filters.category ? { category: filters.category } : {}),
          ...(debouncedLocation ? { location: debouncedLocation } : {}),
          ...(filters.organic ? { organic: filters.organic } : {}),
          ...(filters.minPrice ? { minPrice: filters.minPrice } : {}),
          ...(filters.maxPrice ? { maxPrice: filters.maxPrice } : {}),
        };

        const data = await productService.getProducts(query);
        setProducts(data.products || []);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to fetch products."));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.category, filters.organic, filters.minPrice, filters.maxPrice, debouncedLocation]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await addToCart(productId, 1);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to add product to cart."));
    }
  };

  return (
    <section className="marketplace-layout">
      <div className="page-card filter-card">
        <h2>{t("products.marketplace")}</h2>
        <div className="filter-grid">
          <label>
            {t("products.category")}
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">{t("products.all")}</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t("products.location")}
            <input
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder={t("products.searchLocation")}
            />
          </label>

          <label>
            {t("products.organic")}
            <select name="organic" value={filters.organic} onChange={handleFilterChange}>
              <option value="">{t("products.all")}</option>
              <option value="true">{t("products.organic")}</option>
              <option value="false">{t("products.nonOrganic")}</option>
            </select>
          </label>

          <label>
            {t("products.minPrice")}
            <input
              name="minPrice"
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="0"
            />
          </label>

          <label>
            {t("products.maxPrice")}
            <input
              name="maxPrice"
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="5000"
            />
          </label>
        </div>
      </div>

      <div className="page-card products-results">
        <div className="section-head">
          <h3>{t("products.title")}</h3>
          <p className="muted">{t("products.items", { count: products.length })}</p>
        </div>

        {loading ? <Loader label={t("products.loading")} /> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {!loading && !error ? (
          products.length > 0 ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  disabled={false}
                />
              ))}
            </div>
          ) : (
            <p>{t("products.empty")}</p>
          )
        ) : null}
      </div>
    </section>
  );
}

export default ProductsPage;
