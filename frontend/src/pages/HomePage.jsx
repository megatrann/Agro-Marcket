import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import productService from "../services/productService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { CATEGORY_OPTIONS } from "../utils/constants";

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getProducts();
        setFeaturedProducts((data.products || []).slice(0, 4));
      } catch (error) {
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    await addToCart(productId, 1);
  };

  return (
    <div className="home-layout">
      <section className="hero-card">
        <p className="hero-kicker">{t("home.kicker")}</p>
        <h2>{t("home.headline")}</h2>
        <p>{t("home.description")}</p>
        <div className="hero-actions">
          <Link to="/products" className="btn btn-primary">
            {t("home.explore")}
          </Link>
          <Link to="/register" className="btn btn-outline">
            {t("home.becomeSeller")}
          </Link>
        </div>
      </section>

      <section className="page-card">
        <div className="section-head">
          <h3>{t("home.categories")}</h3>
        </div>
        <div className="chip-grid">
          {CATEGORY_OPTIONS.map((category) => (
            <Link key={category} to={`/products?category=${encodeURIComponent(category)}`} className="chip-link">
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="page-card">
        <div className="section-head">
          <h3>{t("home.featured")}</h3>
          <Link to="/products" className="text-link">
            {t("home.viewAll")}
          </Link>
        </div>

        {loading ? (
          <Loader label={t("home.loadingFeatured")} />
        ) : featuredProducts.length === 0 ? (
          <p>{t("home.noFeatured")}</p>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                disabled={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
