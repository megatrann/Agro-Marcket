import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import useDebounce from "../hooks/useDebounce";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import productService from "../services/productService";
import { CATEGORY_OPTIONS } from "../utils/constants";
import { getApiErrorMessage } from "../utils/apiError";

function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

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
        <h2>Marketplace</h2>
        <div className="filter-grid">
          <label>
            Category
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Location
            <input
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Search location"
            />
          </label>

          <label>
            Organic
            <select name="organic" value={filters.organic} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="true">Organic</option>
              <option value="false">Non-organic</option>
            </select>
          </label>

          <label>
            Min Price
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
            Max Price
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
          <h3>Products</h3>
          <p className="muted">{products.length} items</p>
        </div>

        {loading ? <Loader label="Loading products..." /> : null}
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
            <p>No products found for selected filters.</p>
          )
        ) : null}
      </div>
    </section>
  );
}

export default ProductsPage;
